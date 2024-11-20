import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';

declare var cv: any;
declare var THREE: any;

@Component({
  selector: 'app-serviceberry-ar',
  standalone: true,
  imports: [],
  templateUrl: './serviceberry-ar.component.html',
  styleUrls: ['./serviceberry-ar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ServiceberryArComponent implements OnInit, AfterViewInit {

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Load external scripts
    this.loadScripts([
      'assets/libs/aframe.min.js',
      'assets/libs/mindar-image-aframe.prod.js',
      'assets/libs/aframe-extras.min.js',
      'assets/libs/opencv.js'
    ]).then(() => {
      console.log('All scripts loaded');
    }).catch((error) => {
      console.error('Error loading scripts', error);
    });
  }

  ngAfterViewInit(): void {
    const nativeElement = this.elementRef.nativeElement;

    // Render button
    nativeElement.querySelector('#render-button')?.addEventListener('click', this.onOpenCvReady.bind(this));

    // The button for the model works just fine. Model is pre-textured!
    nativeElement.querySelector('#model-button')?.addEventListener('click', this.loadNewModel.bind(this));

    // Check if model is loaded
    const example3D = document.querySelector('#example-3D') as any;
    if (example3D) {
      example3D.addEventListener('model-loaded', () => {
        console.log('Model loaded successfully');
      });
    }
  }

  // Load the libraries in Assets folder
  loadScripts(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.loadScript(url)));
  }

  loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = false; // Ensure scripts are loaded in order
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  // Ensure OpenCV is fully loaded
  onOpenCvReady() {
    if (!cv || !cv.imread) {
      console.error("OpenCV not loaded properly.");
      return;
    }

    // Get screenshot
    const video: HTMLVideoElement | null = document.querySelector("video");
    if (!video) {
      console.error("Video element not found.");
      return;
    }
    const myCanvas = document.createElement("canvas");

    // Set the canvas dimensions to match the video
    myCanvas.width = video.videoWidth;
    myCanvas.height = video.videoHeight;

    // Draw the current frame of the video onto the canvas
    const context: CanvasRenderingContext2D | null = myCanvas.getContext("2d");
    if (!context) {
      console.error("Canvas context not found.");
      return;
    }

    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    context.drawImage(video, 0, 0, myCanvas.width, myCanvas.height);

    let img = cv.imread(myCanvas);
    let edgeDetected = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.Canny(img, edgeDetected, 100, 200, 3, true);
    cv.findContours(edgeDetected, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);

    const width = img.cols;
    const height = img.rows;

    let target = this.getApprox(contours, width, height);
    if (!target) {
      console.log("Failed to find a target.");
      this.scaleAndShowImage(img, 640, "screenshotCanvas");
      this.scaleAndShowImage(edgeDetected, 640, "resultCanvas");
      hierarchy.delete();
      contours.delete();
      edgeDetected.delete();
      img.delete();
      return;
    }

    let [srcTri, dstTri, dSize] = this.rectify(target);

    let M = cv.getPerspectiveTransform(srcTri, dstTri);

    let transformed = new cv.Mat();
    cv.warpPerspective(img, transformed, M, dSize);

    let grayed = new cv.Mat();
    cv.cvtColor(transformed, grayed, cv.COLOR_RGBA2GRAY, 0);

    let finalImage = new cv.Mat();
    cv.adaptiveThreshold(grayed, finalImage, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 5, 3);

    // this.scaleAndShowImage(img, 600, "screenshotCanvas");
    this.scaleAndShowImage(transformed, 600, "resultCanvas");

    // Convert the canvas to a data URL and use it as a texture
    let image = (<HTMLCanvasElement>document.getElementById("resultCanvas")).toDataURL("image/jpeg", 1.0);

    // Load the texture
    const newTexture = new THREE.TextureLoader().load(image);
    newTexture.flipY = false;  // If necessary, ensure proper orientation
    const example3D = document.querySelector('#example-3D') as any;
    if (example3D && example3D.object3D) {
      example3D.object3D.traverse((node: any) => {
        if (node.isMesh) {
          node.material.map = newTexture;

          // Ensure this is set after updating the texture
          node.material.needsUpdate = true;
        }
      });

      // Set the model back to Berry.glb from colored model
      example3D.setAttribute('gltf-model', 'assets/models/Berry.glb');
      example3D.setAttribute('scale', '0.05 0.05 0.05');
    }

    transformed.delete();
    grayed.delete();
    finalImage.delete();
    M.delete();
    srcTri.delete();
    dstTri.delete();
    target.delete();
    hierarchy.delete();
    contours.delete();
    edgeDetected.delete();
    img.delete();
  }

  // Keep this AS IS. It will load the models properly clicking one after the other
  loadNewModel() {
    const example3D = document.querySelector('#example-3D') as any;
    if (example3D) {
      example3D.setAttribute('gltf-model', 'assets/models/color-berry.glb');
      example3D.setAttribute('scale', '0.05 0.05 0.05');
    }
  }

  getApprox(contours: any, width: number, height: number) {
    const sorted = [];
    for (let i = 0; i < contours.size(); i++) {
      const arcLength = cv.arcLength(contours.get(i), true);
      sorted.push({ arcLength, element: contours.get(i) });
    }
    sorted.sort((a, b) => a.arcLength < b.arcLength ? 1 : b.arcLength < a.arcLength ? -1 : 0);
    const imagePerimeter = 2 * (width + height);
    for (let i = 0; i < contours.size(); i++) {
      if (sorted[i].arcLength >= imagePerimeter) continue;
      let approx = new cv.Mat();
      cv.approxPolyDP(sorted[i].element, approx, 0.02 * sorted[i].arcLength, true);
      if (approx.size().height == 4) return approx;
    }
    return null;
  }

  rectify(target: any) {
    const vertex = [];
    vertex.push(new cv.Point(target.data32S[0 * 4], target.data32S[0 * 4 + 1]));
    vertex.push(new cv.Point(target.data32S[0 * 4 + 2], target.data32S[0 * 4 + 3]));
    vertex.push(new cv.Point(target.data32S[1 * 4], target.data32S[1 * 4 + 1]));
    vertex.push(new cv.Point(target.data32S[1 * 4 + 2], target.data32S[1 * 4 + 3]));

    let xMin = vertex[0].x, yMin = vertex[0].y, xMax = vertex[0].x, yMax = vertex[0].y;
    for (let i = 1; i < vertex.length; i++) {
      if (vertex[i].x < xMin) xMin = vertex[i].x;
      if (vertex[i].x > xMax) xMax = vertex[i].x;
      if (vertex[i].y < yMin) yMin = vertex[i].y;
      if (vertex[i].y > yMax) yMax = vertex[i].y;
    }

    const width = xMax - xMin;
    const height = yMax - yMin;
    const size = new cv.Size(width, height);

    const src = cv.matFromArray(4, 1, cv.CV_32FC2, [
      xMin, yMin, xMax, yMin, xMax, yMax, xMin, yMax
    ]);
    const dst = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0, width, 0, width, height, 0, height
    ]);
    return [src, dst, size];
  }

  scaleAndShowImage(src: any, size: number, id: string) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    canvas.width = size;
    canvas.height = size;
    cv.imshow(id, src);
  }
}
