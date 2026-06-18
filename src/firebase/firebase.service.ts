import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger('FirebaseService');
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Try to load serviceAccount.json
      const serviceAccountPath = path.join(__dirname, '..', 'common', 'firebase', 'serviceAccount.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf-8'),
        );

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          });
          this.isInitialized = true;
          this.logger.log('Firebase initialized successfully');
        }
      } else {
        this.logger.warn('serviceAccount.json not found. Firebase notifications disabled.');
      }
    } catch (error) {
      this.logger.error('Error initializing Firebase:', error);
    }
  }

  async sendNotification(token: string, title: string, body: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const messageId = await admin.messaging().send({
        token,
        notification: { title, body },
      });
      this.logger.log(`Notification sent with ID: ${messageId}`);
      return messageId;
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
