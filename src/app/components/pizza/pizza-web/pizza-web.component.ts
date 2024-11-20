import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-pizza-web',
  standalone: true,
  imports: [],
  templateUrl: './pizza-web.component.html',
  styleUrl: './pizza-web.component.scss'
})
export class PizzaWebComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;
  private controls!: OrbitControls;

  ngOnInit() {
    this.initThreeJS();
    this.animate();
    window.addEventListener('resize', this.onWindowResize, false);
  }

  private initThreeJS() {
    const webglOutput = this.rendererContainer.nativeElement;
    const width = webglOutput.clientWidth;
    const height = webglOutput.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    this.camera.position.set(0, 1, 3);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);
    webglOutput.appendChild(this.renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('assets/models/color-pizza.glb', (gltf: any) => {
      this.model = gltf.scene;
      this.model.position.y -= 1;  // Adjust this value to move the model down
      this.scene.add(this.model);
    });

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.rotateSpeed = 0.5;
    this.controls.update();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  };

  @HostListener('window:resize')
  private onWindowResize = () => {
    const webglOutput = this.rendererContainer.nativeElement;
    const width = webglOutput.clientWidth;
    const height = webglOutput.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  // Zoom In
  zoomIn() {
    this.camera.position.z -= 0.5; // Zoom in by reducing the Z position of the camera
  }

  // Zoom Out
  zoomOut() {
    this.camera.position.z += 0.5; // Zoom out by increasing the Z position of the camera
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const texture = new THREE.TextureLoader().load(e.target.result);
        texture.flipY = false; // GLTF texture coordinates have Y axis flipped by default
        if (this.model) {
          this.model.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((material: THREE.Material) => {
                  if (this.hasMap(material)) {
                    material.map = texture;
                    material.needsUpdate = true;
                  }
                });
              } else if (this.hasMap(mesh.material)) {
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
              }
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private hasMap(material: THREE.Material): material is THREE.MeshStandardMaterial {
    return (material as THREE.MeshStandardMaterial).map !== undefined;
  }

  saveScreenshot() {
    // Ensure the renderer is done rendering
    this.renderer.render(this.scene, this.camera);

    // Create a canvas element to render the scene
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = this.renderer.domElement.width;
      canvas.height = this.renderer.domElement.height;
      context.drawImage(this.renderer.domElement, 0, 0);

      // Convert the canvas to a data URL and download it
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = 'screenshot.png';
      link.click();
    }
  }
}
