import { Injectable, inject } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);
  private activeLoader: HTMLIonLoadingElement | null = null;


  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'success',
    duration = 2500
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }

  async showLoading(message = 'Procesando...') {
    if (this.activeLoader) {
      await this.activeLoader.dismiss();
    }
    this.activeLoader = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
    });
    await this.activeLoader.present();
  }

  async hideLoading() {
    if (this.activeLoader) {
      await this.activeLoader.dismiss();
      this.activeLoader = null;
    }
  }
}
