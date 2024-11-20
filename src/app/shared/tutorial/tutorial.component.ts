import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Ensure you install and import GLTFLoader
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import OrbitControls

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private currentModel: THREE.Object3D | null = null;
  private controls!: OrbitControls; // Declare OrbitControls instance

  currentStep: number = 1; // Tracks the current step
  progress: number = 0; // Progress percentage

  modelUploaded: boolean = false;
  textureUploaded: boolean = false;
  isComplete: boolean = false;

  // Model rotation speed
  private modelRotationSpeed = 0.01;

  ngOnInit() {
    this.initThreeJS();
    this.animate();
    this.updateProgress(); // Initialize progress
  }

  private initThreeJS() {
    const webglOutput = document.getElementById('webgl-output');
    if (webglOutput) {
      const width = webglOutput.clientWidth;
      const height = webglOutput.clientHeight;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(width, height);

      webglOutput.appendChild(this.renderer.domElement);

      // Add basic ambient light for overall illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 1); // White light with full intensity
      this.scene.add(ambientLight);

      // Add a directional light for better model illumination and shadows
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1); // Position the light
      this.scene.add(directionalLight);

      // Add initial cube as a placeholder model
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      this.scene.add(cube);
      this.currentModel = cube;

      this.camera.position.z = 3;

      // Initialize OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;  // Enable smooth transitions
      this.controls.dampingFactor = 0.25;  // Control damping speed
      this.controls.screenSpacePanning = false;  // Optional: Disable panning on the screen

      // No need for dragging events since we won't move the model anymore
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Rotate the model on the Y-axis if it's loaded
    if (this.currentModel) {
      this.currentModel.rotation.y += this.modelRotationSpeed;  // Rotate around the Y-axis
    }

    // Update OrbitControls
    if (this.controls) {
      this.controls.update(); // Update controls for smooth movement
    }

    this.renderer.render(this.scene, this.camera);
  };

  downloadFile() {
    const link = document.createElement('a');
    link.href = 'assets/models/stanford_bunny.glb';
    link.download = 'stanford_bunny.glb';
    link.click();
  }

  downloadTexture() {
    const link = document.createElement('a');
    link.href = 'assets/images/test_texture.png';
    link.download = 'test_texture.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    // Check the file type
    if (type === 'model' && !file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      alert('Please upload a valid GLB or GLTF file');
      return;
    }

    // Read the file based on type
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result;

      if (type === 'model') {
        this.loadGLBModel(file); // Pass the file directly to the loader
        this.modelUploaded = true;
        this.updateProgress();
      } else if (type === 'texture') {
        const texture = new THREE.TextureLoader().load(dataUrl);
        if (this.currentModel) {
          this.currentModel.traverse((child: any) => {
            if (child.isMesh) {
              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          });
        }
        this.textureUploaded = true;
        this.updateProgress();
      }
    };

    reader.readAsDataURL(file); // Read file as data URL for textures, not needed for models
  }

  private loadGLBModel(file: File) {
    const loader = new GLTFLoader();

    loader.load(
      URL.createObjectURL(file),
      (gltf) => {
        if (this.currentModel) {
          this.scene.remove(this.currentModel); // Remove the previous model
        }

        this.currentModel = gltf.scene;
        this.scene.add(gltf.scene);

        // Optionally adjust the model's position or scale
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, -1.5, 0);

        console.log('Model loaded successfully:', gltf.scene);
      },
      (xhr) => {
        console.log(`Model loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  updateProgress() {
    // Calculate the progress as a rounded percentage based on the step
    this.progress = Math.round(((this.currentStep - 1) / 3) * 100);

    // Include specific checks for model and texture upload when relevant
    if (this.currentStep === 2 && this.modelUploaded) {
      this.progress = Math.round((2 / 3) * 100); // 67% for step 2 with model upload
    }
    if (this.currentStep === 3 && this.textureUploaded) {
      this.progress = 100; // 100% when texture is uploaded
    }

    this.isComplete = this.progress === 100;
  }

  nextStep() {
    if (this.canProceed() && this.currentStep < 4) {
      this.currentStep++;
      this.updateProgress(); // Recalculate progress
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress(); // Recalculate progress
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return true; // Step 1: Automatically allow proceed
      case 2:
        return this.modelUploaded; // Step 2: Require a model to be uploaded
      case 3:
        return this.textureUploaded; // Step 3: Require a texture to be uploaded
      default:
        return false; // Step 4: No further steps
    }
  }
}
