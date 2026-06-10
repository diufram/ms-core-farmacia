import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  /**
   * Sends a push notification to an Expo app.
   * @param token The Expo Push Token (e.g. ExponentPushToken[...])
   * @param title The title of the notification
   * @param body The main text body of the notification
   * @param data Optional JSON payload to send with the notification
   */
  async sendPushNotification(token: string, title: string, body: string, data: any = {}) {
    this.logger.log(`Sending push notification to ${token}`);
    
    if (!token || !token.startsWith('ExponentPushToken')) {
      this.logger.warn('Invalid Expo Push Token provided.');
      return false;
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      const response = await fetch(this.EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        this.logger.error(`Failed to send notification: ${JSON.stringify(responseData)}`);
        return false;
      }
      
      this.logger.log(`Successfully pushed notification: ${JSON.stringify(responseData)}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Network error sending notification: ${error.message}`);
      return false;
    }
  }
}
