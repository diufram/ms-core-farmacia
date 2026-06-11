import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface VentaEmailData {
  numeroVenta: string;
  fecha: string;
  total: number;
  sucursal: {
    nombre: string;
    direccion: string;
  };
  cliente?: {
    nombre: string;
    celular?: string;
  };
  detalles: Array<{
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    };

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async enviarVentaCreada(
    destinatario: string,
    data: VentaEmailData,
  ): Promise<{ enviado: boolean; messageId?: string }> {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        'venta-creada.hbs',
      );

      let html: string;

      if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf-8');
        html = hbs.compile(template)(data);
      } else {
        // Fallback si no encuentra el template
        html = this.generarHtmlFallback(data);
      }

      const info = await this.transporter.sendMail({
        from: `"Farmacia - Notificaciones" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: `🛒 Nueva Venta Confirmada - ${data.numeroVenta}`,
        html,
      });

      this.logger.log(`Email enviado: ${info.messageId}`);

      return { enviado: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error('Error enviando email:', error);
      throw error;
    }
  }

  private generarHtmlFallback(data: VentaEmailData): string {
    const detallesHtml = data.detalles
      .map(
        (d) => `
        <tr>
          <td>${d.producto}</td>
          <td>${d.cantidad}</td>
          <td>Bs. ${d.precioUnitario}</td>
          <td>Bs. ${d.subtotal}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <h1>Nueva Venta Confirmada</h1>
      <p><strong>Número:</strong> ${data.numeroVenta}</p>
      <p><strong>Fecha:</strong> ${data.fecha}</p>
      <p><strong>Sucursal:</strong> ${data.sucursal.nombre}</p>
      <p><strong>Total:</strong> Bs. ${data.total}</p>
      <h3>Productos:</h3>
      <table border="1">
        <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
        ${detallesHtml}
      </table>
    `;
  }
}
