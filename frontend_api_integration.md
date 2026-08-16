# Flutter Direct Database Integration Guide

This guide explains how to connect your **Flutter (Dart)** application directly to the Neon PostgreSQL database to create, update, and manage reminders using the `postgres` package.

---

## 🔑 Database Credentials

Use this connection string to connect your Flutter app directly:

```text
postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 📦 Step 1: Add Dependency

Add the modern PostgreSQL package to your Flutter project's `pubspec.yaml`:

```yaml
dependencies:
  postgres: ^3.5.12
```

Then run:
```bash
flutter pub get
```

---

## 🛠️ Step 2: Create Database Service

Create a file named `reminder_db_service.dart` in your Flutter project. This class manages connecting, checking for existing reminders, and inserting/updating them.

```dart
import 'package:postgres/postgres.dart';

class ReminderDbService {
  static const String _connectionUrl =
      'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

  /// Saves a reminder (inserts if it doesn't exist, updates if it does)
  Future<void> createOrUpdateReminder({
    required String token,
    required DateTime time,
    DateTime? endDate,
    String? userId,
    String? appId,
    String? appTitle,
    String? title,
    String? body,
  }) async {
    // 1. Establish the connection directly using the connection URL
    final conn = await Connection.openFromUrl(_connectionUrl);

    try {
      int? existingReminderId;

      // 2. Search if reminder already exists
      if (userId != null && appId != null) {
        // Match by userId and appId
        final result = await conn.execute(
          'SELECT id FROM reminders WHERE "userId" = \$1 AND "appId" = \$2 LIMIT 1',
          parameters: [userId, appId],
        );
        if (result.isNotEmpty) {
          existingReminderId = result.first[0] as int?;
        }
      }

      if (existingReminderId == null && appId != null) {
        // Match by token and appId
        final result = await conn.execute(
          'SELECT id FROM reminders WHERE token = \$1 AND "appId" = \$2 LIMIT 1',
          parameters: [token, appId],
        );
        if (result.isNotEmpty) {
          existingReminderId = result.first[0] as int?;
        }
      }

      if (existingReminderId == null) {
        // Fallback match by token only
        final result = await conn.execute(
          'SELECT id FROM reminders WHERE token = \$1 LIMIT 1',
          parameters: [token],
        );
        if (result.isNotEmpty) {
          existingReminderId = result.first[0] as int?;
        }
      }

      // 3. Perform Insert or Update
      if (existingReminderId != null) {
        // Update existing record
        print('Updating existing reminder with ID: $existingReminderId');
        await conn.execute(
          '''
          UPDATE reminders 
          SET time = \$1, "endDate" = \$2, "userId" = \$3, "appTitle" = \$4, "appId" = \$5, title = \$6, body = \$7, token = \$8
          WHERE id = \$9
          ''',
          parameters: [
            time.toUtc(),
            endDate?.toUtc(),
            userId,
            appTitle,
            appId,
            title,
            body,
            token,
            existingReminderId,
          ],
        );
        print('✅ Reminder updated successfully in NeonDB.');
      } else {
        // Insert new record
        print('Creating new reminder...');
        final result = await conn.execute(
          '''
          INSERT INTO reminders (token, time, "endDate", "userId", "appTitle", "appId", title, body)
          VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8)
          RETURNING id
          ''',
          parameters: [
            token,
            time.toUtc(),
            endDate?.toUtc(),
            userId,
            appTitle,
            appId,
            title,
            body,
          ],
        );
        final newId = result.first[0] as int?;
        print('✅ New reminder created successfully with ID: $newId');
      }
    } catch (e) {
      print('❌ Database error: $e');
    } finally {
      // Always close the connection
      await conn.close();
    }
  }
}
```

---

## 📱 Step 3: Example Usage in Flutter

You can now call the service inside your Flutter/Dart widgets or controller functions (e.g., when a user schedules a notification inside the app UI):

```dart
void scheduleNotification() async {
  final reminderService = ReminderDbService();

  // Trigger time (e.g., today at 6:30 PM UTC)
  final scheduleTime = DateTime.utc(2026, 8, 16, 18, 30);
  
  // Expiration time (e.g., stop repeating after 7 days)
  final expirationTime = DateTime.now().add(const Duration(days: 7));

  await reminderService.createOrUpdateReminder(
    token: 'DEVICE_FCM_TOKEN_HERE',
    time: scheduleTime,
    endDate: expirationTime,
    userId: 'flutter_user_9923',
    appId: 'com.example.fitnessapp',
    appTitle: 'Fitness Tracker App',
    title: 'Daily Workout',
    body: 'Time to track your daily progress!',
  );
}
```
