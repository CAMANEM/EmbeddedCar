import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MovementService } from '../services/movement.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  
  // UI State
  speedValue: number = 0;
  activeTab: string = 'manual';
  servoAngle: number = 0; // Center position
  
  
  // Visual indicators
  currentMovement: string = 'Detenido';
  currentMovementIcon: string = '🛑';
  currentDirection: string = 'Sin dirección';
  currentDirectionIcon: string = '❌';
  vehicleStatus: string = 'Detenido';
  gear: string = 'P';
  gearIcon: string = '🅿️';
  
  // Teclado siempre activo
  keyboardControlEnabled: boolean = true; 
  activeKeys: Set<string> = new Set();
  keyPressIndicator: string = '';
  
  // Se validan solo las teclas de las flechas y de espacio
  private readonly ALLOWED_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'] as const;
  
  constructor(
    private router: Router,
    private movementService: MovementService
  ) {}

  ngOnInit() {
    console.log('Dashboard inicializado');
    console.log('CONTROL DE TECLADO GLOBAL ACTIVO:');
    console.log('⬆️ Flecha Arriba: Avanzar');
    console.log('⬇️ Flecha Abajo: Retroceder');
    console.log('⬅️ Flecha Izquierda: Girar izquierda');
    console.log('➡️ Flecha Derecha: Girar derecha');
    console.log('🔲 Barra Espaciadora: Detener');
    console.log(' Teclado moviendo el carro');
    console.log('Solo estas 5 teclas están permitidas');

  }

  ngOnDestroy() {
    console.log('Dashboard destruido - limpiando listeners de teclado');
    this.activeKeys.clear();
  }

  // Método para cambiar de pestaña
  selectTab(tabName: string) {
    this.activeTab = tabName;
    console.log(`Pestaña seleccionada: ${tabName}`);
  }

  // Método para cerrar sesión
  logout() {
    console.log('Cerrando sesión...');

    // Limpiar datos de sesión 
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();

    // Mostrar mensaje de confirmación
    alert('Sesión cerrada exitosamente');

    // Redirigir al login 
    this.router.navigate(['/']).then(() => {
      console.log('Navegación exitosa al login');
    }).catch(error => {
      console.error('Error en navegación:', error);
      // Método alternativo usando window.location
      window.location.href = '/';
    });
  }

  // Método para verificar si una pestaña está activa
  isTabActive(tabName: string): boolean {
    return this.activeTab === tabName;
  }

  onSpeedChange(speed: number) {
    console.log(`Velocidad cambiada a: ${speed}%`);
    // lógica para enviar la velocidad al backend

  }

  // Funciones para el control direccional
  moveForward() {
    console.log(`Moviendo hacia adelante a velocidad: ${this.speedValue}%`);

    this.updateVehicleStatus('Adelante', '⬆️', this.currentDirection, this.currentDirectionIcon, 'Moviendo', 'MovementFunction');

    // Map frontend values to backend values
    const backendMovement = this.mapMovementToBackend(this.currentMovement);
    const backendDirection = this.mapDirectionToBackend(this.currentDirection);
        
    this.movementService.updateCarMovement(backendMovement, this.speedValue, backendDirection).subscribe({
      next: (response) => {
        console.log('✅ Movement response:', response);
      },
      error: (error) => {
        console.error('❌ Movement error:', error);
        this.updateVehicleStatus('Error', '❌', 'Error', '❌', 'Error', 'MovementFunction');
      }
    });
  }

  moveBackward() {
    console.log(`Moviendo hacia atrás a velocidad: ${this.speedValue}%`);
    
    this.updateVehicleStatus('Atrás', '⬇️', this.currentDirection, this.currentDirectionIcon, 'Moviendo', 'MovementFunction');

    // Map frontend values to backend values
    const backendMovement = this.mapMovementToBackend(this.currentMovement);
    const backendDirection = this.mapDirectionToBackend(this.currentDirection);
        
    this.movementService.updateCarMovement(backendMovement, this.speedValue, backendDirection).subscribe({
      next: (response) => {
        console.log('✅ Movement response:', response);
      },
      error: (error) => {
        console.error('❌ Movement error:', error);
        this.updateVehicleStatus('Error', '❌', 'Error', '❌', 'Error', 'MovementFunction');
      }
    });
  }

  moveLeft() {
    console.log(`Girando a la izquierda a velocidad: ${this.speedValue}%`);

    this.updateVehicleStatus(this.currentMovement, this.currentMovementIcon, 'Izquierda', '⬅️', 'Girando', 'DirectionFunction');

    // Map frontend values to backend values
    const backendMovement = this.mapMovementToBackend(this.currentMovement);
    const backendDirection = this.mapDirectionToBackend(this.currentDirection);
      
    this.movementService.updateCarMovement(backendMovement, this.speedValue, backendDirection).subscribe({
      next: (response) => {
        console.log('✅ Movement response:', response);
      },
      error: (error) => {
        console.error('❌ Movement error:', error);
        this.updateVehicleStatus('Error', '❌', 'Error', '❌', 'Error', 'DirectionFunction');
      }
    });
  }

  moveRight() {
    console.log(`Girando a la derecha a velocidad: ${this.speedValue}%`);

    this.updateVehicleStatus(this.currentMovement, this.currentMovementIcon, 'Derecha', '➡️', 'Girando', 'DirectionFunction');
    
    // Map frontend values to backend values
    const backendMovement = this.mapMovementToBackend(this.currentMovement);
    const backendDirection = this.mapDirectionToBackend(this.currentDirection);
    
    this.movementService.updateCarMovement(backendMovement, this.speedValue, backendDirection).subscribe({
      next: (response) => {
        console.log('✅ Movement response:', response);
      },
      error: (error) => {
        console.error('❌ Movement error:', error);
        this.updateVehicleStatus('Error', '❌', 'Error', '❌', 'Error', 'DirectionFunction');
      }
    });
  }

  stopCar() {
    console.log('Deteniendo el carro');
    
    // Map frontend values to backend values

    this.updateVehicleStatus('Detenido', '🛑', 'Sin dirección', '❌', 'Detenido', 'MovementFunction');
    this.updateVehicleStatus('Detenido', '🛑', 'Sin dirección', '❌', 'Detenido', 'DirectionFunction');

    const backendMovement = this.mapMovementToBackend(this.currentMovement);
    const backendDirection = this.mapDirectionToBackend(this.currentDirection);
    
    this.movementService.updateCarMovement(backendMovement, 0, backendDirection).subscribe({
      next: (response) => {
        console.log('✅ Movement response:', response);
      },
      error: (error) => {
        console.error('❌ Movement error:', error);
        this.updateVehicleStatus('Error', '❌','Error', '❌', 'Error', 'MovementFunction');
        this.updateVehicleStatus('Error', '❌','Error', '❌', 'Error', 'DirectionFunction');
      }
    });
  }

  // Helper functions to map frontend values to backend values
  private mapMovementToBackend(frontendMovement: string): string {
    const movementMap: { [key: string]: string } = {
      'Adelante': 'forward',
      'Atrás': 'backward',
      'Detenido': 'none'
    };
    return movementMap[frontendMovement] || 'none';
  }

  private mapDirectionToBackend(frontendDirection: string): string {
    const directionMap: { [key: string]: string } = {
      'Izquierda': 'left',
      'Derecha': 'right',
      'Sin dirección': 'none'
    };
    return directionMap[frontendDirection] || 'none';
  }
  // Método para actualizar el estado visual del vehículo
  updateVehicleStatus(movement: string, movementIcon: string, direction: string, directionIcon: string, vehicleStatus: string, requestedBy: string) {

    // Updates direction
    if(direction === 'Izquierda' && requestedBy === 'DirectionFunction') {
      switch(this.currentDirection){
        case 'Izquierda':
          this.currentDirection = 'Izquierda';
          this.currentDirectionIcon = '⬅️';
          break;
        case 'Sin dirección':
          this.currentDirection = 'Izquierda';
          this.currentDirectionIcon = '⬅️';
          break;
        case 'Derecha':
          this.currentDirection = 'Sin dirección';
          this.currentDirectionIcon = '❌';
          break;
      }
    } else if(direction === 'Derecha'  && requestedBy === 'DirectionFunction') {
      switch(this.currentDirection){
        case 'Izquierda':
          this.currentDirection = 'Sin dirección';
          this.currentDirectionIcon = '❌';
          break;
        case 'Sin dirección':
          this.currentDirection = 'Derecha';
          this.currentDirectionIcon = '➡️';
          break;
        case 'Derecha':
          this.currentDirection = 'Derecha';
          this.currentDirectionIcon = '➡️';
          break;
      }
    }

    // Updates movement
    if (movement === 'Adelante' && requestedBy === 'MovementFunction') {
      switch(this.gear) {
        case 'R4':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R3';
          this.gearIcon = '⬇️3️⃣';
          this.speedValue = 75;
          break;
        case 'R3':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R2';
          this.gearIcon = '⬇️2️⃣';
          this.speedValue = 50;
          break;
        case 'R2':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R1';
          this.gearIcon = '⬇️1️⃣';
          this.speedValue = 25;
          break;
        case 'R1':
          this.currentMovement = 'Detenido';
          this.currentMovementIcon = '🛑';
          this.gear = 'P';
          this.gearIcon = '🅿️';
          this.speedValue = 0;
          break;
        case 'P':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '1';
          this.gearIcon = '⬆️1️⃣';
          this.speedValue = 25;
          break;
        case '1':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '2';
          this.gearIcon = '⬆️2️⃣';
          this.speedValue = 50;
          break;
        case '2':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '3';
          this.gearIcon = '⬆️3️⃣';
          this.speedValue = 75;
          break;
        case '3':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '4';
          this.gearIcon = '⬆️4️⃣';
          this.speedValue = 100;
          break;
        case '4':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '4';
          this.gearIcon = '⬆️4️⃣';
          this.speedValue = 100;
          break;
      }
    } else if (movement === 'Atrás' && requestedBy === 'MovementFunction') {
      switch(this.gear) {
        case '4':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '3';
          this.gearIcon = '⬆️3️⃣';
          this.speedValue = 75;
          break;
        case '3':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '2';
          this.gearIcon = '⬆️2️⃣';
          this.speedValue = 50;
          break;
        case '2':
          this.currentMovement = 'Adelante';
          this.currentMovementIcon = '⬆️';
          this.gear = '1';
          this.gearIcon = '⬆️1️⃣';
          this.speedValue = 25;
          break;
        case '1':
          this.currentMovement = 'Detenido';
          this.currentMovementIcon = '🛑';
          this.gear = 'P';
          this.gearIcon = '🅿️';
          this.speedValue = 0;
          break;
        case 'P':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R1';
          this.gearIcon = '⬇️1️⃣';
          this.speedValue = 25;
          break;
        case 'R1':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R2';
          this.gearIcon = '⬇️2️⃣';
          this.speedValue = 50;
          break;
        case 'R2':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R3';
          this.gearIcon = '⬇️3️⃣';
          this.speedValue = 75;
          break;
        case 'R3':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R4';
          this.gearIcon = '⬇️4️⃣';
          this.speedValue = 100;
          break;
        case 'R4':
          this.currentMovement = 'Atrás';
          this.currentMovementIcon = '⬇️';
          this.gear = 'R4';
          this.gearIcon = '⬇️4️⃣';
          this.speedValue = 100;
          break;
      }
    } else if (movement === 'Detenido' && requestedBy === 'MovementFunction') {
      this.currentMovement = 'Detenido';
      this.currentMovementIcon = '🛑';
      this.gear = 'P';
      this.gearIcon = '🅿️';
      this.speedValue = 0;
    }

    this.vehicleStatus = vehicleStatus;
  }

  // Control del carro con teclas de flecha 
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.ALLOWED_KEYS.includes(event.code as any)) {
      return; 
    }
    event.preventDefault();

    if (this.activeKeys.has(event.code)) return;

    this.activeKeys.add(event.code);
    this.updateKeyIndicator();

    switch (event.code) {
      case 'ArrowUp':
        console.log(`🎮 Teclado: Avanzar (↑) - Desde sección: ${this.activeTab.toUpperCase()}`);
        this.moveForward();
        break;
      case 'ArrowDown':
        console.log(`🎮 Teclado: Retroceder (↓) - Desde sección: ${this.activeTab.toUpperCase()}`); 
        this.moveBackward();
        break;
      case 'ArrowLeft':
        console.log(`🎮 Teclado: Girar izquierda (←) - Desde sección: ${this.activeTab.toUpperCase()}`);
        this.moveLeft();
        break;
      case 'ArrowRight':
        console.log(`🎮 Teclado: Girar derecha (→) - Desde sección: ${this.activeTab.toUpperCase()}`);
        this.moveRight();
        break;
      case 'Space':
        console.log(`🎮 Teclado: Detener (Espacio) - Desde sección: ${this.activeTab.toUpperCase()}`);
        this.stopCar();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    //  Reconoce las teclas de la flecha y la de espacio 
    if (!this.ALLOWED_KEYS.includes(event.code as any)) {
      return; // Ignorar cualquier otra tecla
    }
    this.activeKeys.delete(event.code);
    this.updateKeyIndicator();
  }

  // Método para mostrar indicador visual de teclas activas
  private updateKeyIndicator() {
    const keyMap: { [key: string]: string } = {
      'ArrowUp': '⬆️',
      'ArrowDown': '⬇️', 
      'ArrowLeft': '⬅️',
      'ArrowRight': '➡️',
      'Space': 'Detenido'
    };

    this.keyPressIndicator = Array.from(this.activeKeys)
      .map(key => keyMap[key] || key)
      .join(' ');
  }

  // Método de información del teclado 
  showKeyboardInfo() {
    console.log('Control de teclado siempre activo');
    console.log('  • ⬆️ ⬇️ ⬅️ ➡️ para mover');
    console.log('  • 🔲 Espacio para detener');
    console.log('  • Funciona junto con los botones D-pad');
  }

  // Stream properties
  currentStreamMethod: string = 'gstreamer';
  streamActive: boolean = false;
  refreshInterval: any = null;

  // Stream methods
  updateUrls(): { gstreamerUrl: string; mjpegUrl: string } {
    const ipElement = document.getElementById('rpiIp') as HTMLInputElement;
    const portElement = document.getElementById('rpiPort') as HTMLInputElement;
    
    const ip = ipElement?.value || '192.168.0.117';
    const port = portElement?.value || '8080';
    
    const gstreamerUrl = `http://localhost:3000/api/camera/gstreamer-stream?ip=${ip}&port=${port}`;
    const mjpegUrl = `http://localhost:3000/api/camera/mjpeg-stream?ip=${ip}&port=${port}`;
    
    const currentIpElement = document.getElementById('current-ip');
    const gstreamerUrlElement = document.getElementById('gstreamer-url');
    
    if (currentIpElement) currentIpElement.textContent = ip;
    if (gstreamerUrlElement) gstreamerUrlElement.textContent = gstreamerUrl;
    
    return { gstreamerUrl, mjpegUrl };
  }
  
  updateStatus(method: string, status: string, message: string): void {
    const statusDiv = document.getElementById(`${method}-status`);
    const statusText = document.getElementById(`${method}-status-text`);
    const card = document.getElementById(`${method}-card`);
    
    if (statusDiv) statusDiv.className = `fpv_status ${status}`;
    if (statusText) statusText.textContent = message;
    
    if (card) {
      if (status === 'connected') {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
    
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) lastUpdateElement.textContent = new Date().toLocaleTimeString();
  }
  
  startStream(): void {
    console.log('▶️ Starting stream...');
    if (this.streamActive) {
      console.log('Stream already active');
      return;
    }
    
    const urls = this.updateUrls();
    this.streamActive = true;
    
    // Try GStreamer first
    console.log('🎯 Starting GStreamer stream...');
    console.log('🔗 GStreamer URL:', urls.gstreamerUrl);
    
    const gstreamerImg = document.getElementById('gstreamer-stream') as HTMLImageElement;
    
    if (gstreamerImg) {
      // Set loading status
      this.updateStatus('gstreamer', 'connecting', 'Conectando...');
      
      gstreamerImg.onload = () => {
        console.log('✅ GStreamer stream connected');
        this.updateStatus('gstreamer', 'connected', 'Conectado - Recibiendo video');
        gstreamerImg.style.display = 'block';
        this.currentStreamMethod = 'gstreamer';
      };
      
      gstreamerImg.onerror = (error) => {
        console.log('❌ GStreamer failed:', error);
        console.log('🔍 Trying to fallback to MJPEG...');
        this.updateStatus('gstreamer', 'disconnected', 'Error de conexión');
        gstreamerImg.style.display = 'none';
        
        // Fallback to MJPEG
        const mjpegImg = document.getElementById('mjpeg-stream') as HTMLImageElement;
        
        if (mjpegImg) {
          console.log('🔗 MJPEG URL:', urls.mjpegUrl);
          this.updateStatus('mjpeg', 'connecting', 'Probando MJPEG...');
          
          mjpegImg.onload = () => {
            console.log('✅ MJPEG stream connected');
            this.updateStatus('mjpeg', 'connected', 'Conectado - Recibiendo video');
            mjpegImg.style.display = 'block';
            this.currentStreamMethod = 'mjpeg';
          };
          
          mjpegImg.onerror = (mjpegError) => {
            console.log('❌ Both streams failed');
            console.error('MJPEG Error:', mjpegError);
            this.updateStatus('mjpeg', 'disconnected', 'Error: Raspberry Pi no disponible');
            mjpegImg.style.display = 'none';
            this.streamActive = false;
            
            // Show user-friendly error message
            alert('❌ No se pudo conectar al video stream.\n\n' +
                  '1. Verifica que la Raspberry Pi esté encendida\n' +
                  '2. Verifica la IP: ' + (document.getElementById('rpiIp') as HTMLInputElement)?.value + '\n' +
                  '3. Asegúrate de que el stream esté activo en la Raspberry Pi');
          };
          
          mjpegImg.src = urls.mjpegUrl + '&t=' + Date.now();
        }
      };
      
      // Add timeout for connection attempt
      setTimeout(() => {
        if (this.streamActive && !gstreamerImg.complete) {
          console.log('⏰ Connection timeout, trying fallback');
          gstreamerImg.onerror?.(new Event('timeout'));
        }
      }, 10000); // 10 second timeout
      
      gstreamerImg.src = urls.gstreamerUrl + '&t=' + Date.now();
    }
    
    // Start refresh interval
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => this.refreshStream(), 30000); // Refresh every 30 seconds
  }
  
  stopStream(): void {
    this.streamActive = false;
    
    // Hide all streams
    const gstreamerImg = document.getElementById('gstreamer-stream') as HTMLImageElement;
    const mjpegImg = document.getElementById('mjpeg-stream') as HTMLImageElement;
    
    if (gstreamerImg) gstreamerImg.style.display = 'none';
    if (mjpegImg) mjpegImg.style.display = 'none';
    
    // Update status
    this.updateStatus('gstreamer', 'disconnected', 'Desconectado');
    this.updateStatus('mjpeg', 'disconnected', 'Desconectado');
    
    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    console.log('⏹️ Stream stopped');
  }
  
  refreshStream(): void {
    if (!this.streamActive) return;
    
    console.log('🔄 Refreshing stream...');
    
    const urls = this.updateUrls();
    const activeImg = document.getElementById(`${this.currentStreamMethod}-stream`) as HTMLImageElement;
    
    if (activeImg && activeImg.style.display === 'block') {
      const newUrl = this.currentStreamMethod === 'gstreamer' ? urls.gstreamerUrl : urls.mjpegUrl;
      activeImg.src = newUrl + '&t=' + Date.now();
    }
  }

  // Capture screenshot from video stream
  captureScreenshot(): void {
    if (!this.streamActive) {
      alert('No hay stream activo para capturar');
      return;
    }

    console.log('Capturing screenshot...');
    
    const gstreamerImg = document.getElementById('gstreamer-stream') as HTMLImageElement;
    
    if (!gstreamerImg || gstreamerImg.style.display === 'none') {
      alert(' No se puede capturar: video no disponible');
      return;
    }

    try {
      // Create a canvas element to capture the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        alert(' Error: no se pudo crear el contexto del canvas');
        return;
      }

      // Set canvas size to match the image
      canvas.width = gstreamerImg.naturalWidth || gstreamerImg.width;
      canvas.height = gstreamerImg.naturalHeight || gstreamerImg.height;

      // Draw the image onto the canvas
      ctx.drawImage(gstreamerImg, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('❌ Error al generar la imagen');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `captura-camara-${timestamp}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('✅ Screenshot saved successfully');
        
        // Show success message
        const statusText = document.getElementById('gstreamer-status-text');
        const originalText = statusText?.textContent;
        if (statusText) {
          statusText.textContent = 'Captura guardada';
          setTimeout(() => {
            if (statusText && originalText) {
              statusText.textContent = originalText;
            }
          }, 2000);
        }
        
      }, 'image/png', 1.0);

    } catch (error) {
      console.error(' Error capturing screenshot:', error);
      alert(' Error al capturar la pantalla. Verifique que el video esté cargado correctamente.');
    }
  }

  // Test connection to Raspberry Pi
  testConnection(): void {
    const ip = (document.getElementById('rpiIp') as HTMLInputElement)?.value || '192.168.0.117';
    const port = (document.getElementById('rpiPort') as HTMLInputElement)?.value || '8080';
    
    console.log(`🔍 Testing connection to ${ip}:${port}`);
    
    // Test backend API first
    fetch(`/api/camera/?`)
      .then(response => response.json())
      .then(data => {
        console.log('✅ Backend API is working:', data);
        
        // Now test the specific camera endpoint
        return fetch(`/api/camera/gstreamer-stream?ip=${ip}&port=${port}&test=true`);
      })
      .then(response => {
        if (response.ok) {
          console.log('✅ Camera endpoint is accessible');
          alert('✅ Conexión exitosa!\nEl backend puede acceder a la Raspberry Pi.');
        } else {
          console.log('❌ Camera endpoint failed:', response.status);
          alert(`❌ Error de conexión (${response.status})\nVerifica que la Raspberry Pi esté transmitiendo en ${ip}:${port}`);
        }
      })
      .catch(error => {
        console.error('❌ Connection test failed:', error);
        alert('❌ Error de conexión\nVerifica que el backend esté ejecutándose y la IP sea correcta.');
      });
  }

  // Initialize stream functionality
  ngAfterViewInit(): void {
    console.log('🎥 GStreamer Video Interface loaded');
    this.updateUrls();
    
    // Auto-refresh URLs when inputs change
    const rpiIpElement = document.getElementById('rpiIp');
    const rpiPortElement = document.getElementById('rpiPort');
    
    if (rpiIpElement) {
      rpiIpElement.addEventListener('input', () => this.updateUrls());
    }
    if (rpiPortElement) {
      rpiPortElement.addEventListener('input', () => this.updateUrls());
    }
  }
}

