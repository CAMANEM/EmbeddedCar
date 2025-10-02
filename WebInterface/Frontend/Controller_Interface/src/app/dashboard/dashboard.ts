import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  
  speedValue: number = 50;
  activeTab: string = 'manual'; // Pestaña activa por defecto

  constructor(private router: Router) {}

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
    // Lógica para mover el carro hacia adelante
  }

  moveBackward() {
    console.log(`Moviendo hacia atrás a velocidad: ${this.speedValue}%`);
    // Lógica para mover el carro hacia atrás
  }

  moveLeft() {
    console.log(`Girando a la izquierda a velocidad: ${this.speedValue}%`);
    // Lógica para girar el carro a la izquierda
  }

  moveRight() {
    console.log(`Girando a la derecha a velocidad: ${this.speedValue}%`);
    // Lógica para girar el carro a la derecha
  }

  stopCar() {
    console.log('Deteniendo el carro');
    // Lógica para detener el carro
  }
}
