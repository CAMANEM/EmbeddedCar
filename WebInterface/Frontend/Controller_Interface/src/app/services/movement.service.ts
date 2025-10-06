import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';

export interface MovementRequest {
  speed?: number;
  duration?: number;
  angle?: number;
}

export interface MovementResponse {
  status: string;
  movement?: string;  // Added movement property
  direction?: string;
  speed?: number;
  duration?: number;
  angle?: number;
  message?: string;
  timestamp: string;
  car_id?: string;
}

export interface ConnectionResponse {
  status: string;
  message: string;
  timestamp: string;
  car_id: string;
}

export interface CarStatus {
  isConnected: boolean;
  currentDirection: string;
  currentSpeed: number;
  vehicleStatus: string;
  lastUpdate: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private readonly API_BASE_URL = 'http://localhost:3000/api/car';
  
  private carStatusSubject = new BehaviorSubject<CarStatus>({
    isConnected: false,
    currentDirection: 'Detenido',
    currentSpeed: 0,
    vehicleStatus: 'Detenido',
    lastUpdate: new Date().toISOString()
  });
  
  public carStatus$ = this.carStatusSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Connect to the car system
   */
  connectToCar(): Observable<ConnectionResponse> {
    return this.http.post<ConnectionResponse>(`${this.API_BASE_URL}/connect`, {}, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'connected') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Detenido',
              currentSpeed: 0,
              vehicleStatus: 'Conectado',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<ConnectionResponse>('connectToCar', {
          status: 'error',
          message: 'Failed to connect to car',
          timestamp: new Date().toISOString(),
          car_id: ''
        }))
      );
  }

  /**
   * Update car movement
   */
  updateCarMovement(movement: string, speed: number, direction: string): Observable<MovementResponse> {
    const request = { movement, speed, direction };
    
    console.log('🚗 Sending car movement update:', request);
    
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/update_movement`, request, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('✅ Car movement response:', response);
          
          if (response.status === 'updated') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: this.mapDirectionToDisplay(response.direction || direction),
              currentSpeed: response.speed || speed,
              vehicleStatus: this.mapMovementToStatus(response.movement || movement),
              lastUpdate: response.timestamp || new Date().toISOString()
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('updateCarMovement'))
      );
  }

  /**
   * Map backend direction values to display values
   */
  private mapDirectionToDisplay(direction: string): string {
    const directionMap: { [key: string]: string } = {
      'none': 'Sin dirección',
      'left': 'Izquierda',
      'right': 'Derecha'
    };
    return directionMap[direction] || direction;
  }

  /**
   * Map backend movement values to status values
   */
  private mapMovementToStatus(movement: string): string {
    const statusMap: { [key: string]: string } = {
      'none': 'Detenido',
      'forward': 'Adelante',
      'backward': 'Atrás'
    };
    return statusMap[movement] || 'Moviendo';
  }

  /**
   * Move car forward
   */
  moveForward(speed: number = 50, duration?: number): Observable<MovementResponse> {
    const request: MovementRequest = { speed, duration };
    
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/move_forward`, request, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'moving') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Adelante',
              currentSpeed: response.speed || speed,
              vehicleStatus: 'Moviendo',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('moveForward'))
      );
  }

  /**
   * Move car backwards
   */
  moveBackward(speed: number = 50, duration?: number): Observable<MovementResponse> {
    const request: MovementRequest = { speed, duration };
    
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/move_backwards`, request, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'moving') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Atrás',
              currentSpeed: response.speed || speed,
              vehicleStatus: 'Moviendo',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('moveBackward'))
      );
  }

  /**
   * Turn car left
   */
  moveLeft(angle: number = 45, speed: number = 30): Observable<MovementResponse> {
    const request: MovementRequest = { angle, speed };
    
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/move_left`, request, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'turning') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Izquierda',
              currentSpeed: response.speed || speed,
              vehicleStatus: 'Girando',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('moveLeft'))
      );
  }

  /**
   * Turn car right
   */
  moveRight(angle: number = 45, speed: number = 30): Observable<MovementResponse> {
    const request: MovementRequest = { angle, speed };
    
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/move_right`, request, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'turning') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Derecha',
              currentSpeed: response.speed || speed,
              vehicleStatus: 'Girando',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('moveRight'))
      );
  }

  /**
   * Stop/brake the car
   */
  stopCar(): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`${this.API_BASE_URL}/brake`, {}, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'stopped') {
            this.updateCarStatus({
              isConnected: true,
              currentDirection: 'Detenido',
              currentSpeed: 0,
              vehicleStatus: 'Detenido',
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<MovementResponse>('stopCar'))
      );
  }

  /**
   * Check car API status
   */
  checkCarStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/`, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.status === 'OK') {
            // Update connection status if API is responsive
            const currentStatus = this.carStatusSubject.value;
            this.updateCarStatus({
              ...currentStatus,
              isConnected: true,
              lastUpdate: response.timestamp
            });
          }
        }),
        catchError(this.handleError<any>('checkCarStatus'))
      );
  }

  /**
   * Get current car status
   */
  getCurrentStatus(): CarStatus {
    return this.carStatusSubject.value;
  }

  /**
   * Check if car is connected
   */
  isCarConnected(): boolean {
    return this.carStatusSubject.value.isConnected;
  }

  /**
   * Disconnect from car (local state only)
   */
  disconnectCar(): void {
    this.updateCarStatus({
      isConnected: false,
      currentDirection: 'Detenido',
      currentSpeed: 0,
      vehicleStatus: 'Desconectado',
      lastUpdate: new Date().toISOString()
    });
  }

  /**
   * Update car status
   */
  private updateCarStatus(status: CarStatus): void {
    this.carStatusSubject.next(status);
  }

  /**
   * Error handling
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Update connection status on communication errors
      if (error.status === 0 || error.status === 500) {
        const currentStatus = this.carStatusSubject.value;
        this.updateCarStatus({
          ...currentStatus,
          isConnected: false,
          vehicleStatus: 'Error de conexión',
          lastUpdate: new Date().toISOString()
        });
      }
      
      // Return default result or create error response
      if (result) {
        return of(result as T);
      }
      
      const errorResponse = {
        status: 'error',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      } as T;
      
      return of(errorResponse);
    };
  }

  /**
   * Validate speed parameter
   */
  private validateSpeed(speed: number): boolean {
    return speed >= 0 && speed <= 100;
  }

  /**
   * Validate angle parameter
   */
  private validateAngle(angle: number): boolean {
    return angle >= 0 && angle <= 90;
  }

  /**
   * Get movement with validation
   */
  moveForwardWithValidation(speed: number, duration?: number): Observable<MovementResponse> {
    if (!this.validateSpeed(speed)) {
      return of({
        status: 'error',
        message: 'Speed must be between 0 and 100',
        timestamp: new Date().toISOString()
      } as MovementResponse);
    }
    return this.moveForward(speed, duration);
  }

  /**
   * Get turn with validation
   */
  turnWithValidation(direction: 'left' | 'right', angle: number, speed: number): Observable<MovementResponse> {
    if (!this.validateAngle(angle)) {
      return of({
        status: 'error',
        message: 'Angle must be between 0 and 90 degrees',
        timestamp: new Date().toISOString()
      } as MovementResponse);
    }
    
    if (!this.validateSpeed(speed)) {
      return of({
        status: 'error',
        message: 'Speed must be between 0 and 100',
        timestamp: new Date().toISOString()
      } as MovementResponse);
    }
    
    return direction === 'left' ? this.moveLeft(angle, speed) : this.moveRight(angle, speed);
  }
}
