import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import throttle from 'lodash.throttle';
import { gsap } from 'gsap';

export default class WebGL {
    winSize: {
        [s: string]: number;
    };
    elms: {
        [s: string]: HTMLElement;
    };
    elmsAll: {
        [s: string]: NodeListOf<HTMLElement>;
    };
    dpr: number;
    three: {
        scene: THREE.Scene;
        renderer: THREE.WebGLRenderer | null;
        clock: THREE.Clock;
        // textRMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null;
        textRMesh: any | null;
        textEMesh: any | null;
        textAMesh: any | null;
        textCMesh: any | null;
        textTMesh: any | null;
        textDotMesh: any | null;
        textJMesh: any | null;
        textSMesh: any | null;
        camera: THREE.PerspectiveCamera | null;
        cameraFov: number;
        cameraAspect: number;
        cameraFar: number;
    };
    sp: boolean;
    ua: string;
    mq: MediaQueryList;
    srcObj: string;
    flg: {
        [s: string]: boolean;
    };
    constructor() {
        this.winSize = {
            wd: window.innerWidth,
            wh: window.innerHeight,
        };
        this.elms = {
            canvas: document.querySelector('[data-canvas]'),
            // buttonsWrapper: document.querySelector('[data-button="wrapper"]'),
            // soccerBall: document.querySelector('[data-button="soccerBall"]'),
            // basketBall: document.querySelector('[data-button="basketBall"]'),
            // volleyBall: document.querySelector('[data-button="volleyBall"]'),
            // mvHomeLink: document.querySelector('[data-mv="homeLink"]'),
            // mvNoteLink: document.querySelector('[data-mv="noteLink"]'),
            // mvGitLink: document.querySelector('[data-mv="gitLink"]'),
        };
        this.elmsAll = {
            // mvTitle: document.querySelectorAll('.mv__text'),
        };
        // デバイスピクセル比(最大値=2)
        this.dpr = Math.min(window.devicePixelRatio, 2);
        this.three = {
            scene: null,
            renderer: null,
            clock: null,
            textRMesh: null,
            textEMesh: null,
            textAMesh: null,
            textCMesh: null,
            textTMesh: null,
            textDotMesh: null,
            textJMesh: null,
            textSMesh: null,
            camera: null,
            cameraFov: 75,
            cameraAspect: window.innerWidth / window.innerHeight,
            cameraFar: 100,
        };
        this.sp = null;
        this.ua = window.navigator.userAgent.toLowerCase();
        this.mq = window.matchMedia('(max-width: 768px)');
        this.srcObj = './obj/react-d.glb';
        this.flg = {
            loaded: false,
        };
        this.init();
    }
    init(): void {
        this.getLayout();
        this.initScene();
        this.initCamera();
        this.initClock();
        this.initRenderer();
        this.setModels();
        this.setLight();
        this.handleEvents();

        if (this.ua.indexOf('msie') !== -1 || this.ua.indexOf('trident') !== -1) {
            return;
        } else {
            this.mq.addEventListener('change', this.getLayout.bind(this));
        }
    }
    getLayout(): void {
        this.sp = this.mq.matches ? true : false;
    }
    initScene(): void {
        // シーンを作成
        this.three.scene = new THREE.Scene();
    }
    initCamera(): void {
        // カメラを作成(視野角, スペクト比, near, far)
        this.three.camera = new THREE.PerspectiveCamera(this.three.cameraFov, this.winSize.wd / this.winSize.wh, this.three.cameraAspect, this.three.cameraFar);
        this.three.camera.position.set(0, 0, 9);
    }
    initClock(): void {
        // 時間計測用
        this.three.clock = new THREE.Clock();
    }
    initRenderer(): void {
        // レンダラーを作成
        this.three.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, //背景色を設定しないとき、背景を透明にする
        });
        // this.three.renderer.setClearColor(0xffffff); //背景色
        this.three.renderer.setPixelRatio(this.dpr); // retina対応
        this.three.renderer.setSize(this.winSize.wd, this.winSize.wh); // 画面サイズをセット
        this.three.renderer.physicallyCorrectLights = true;
        this.three.renderer.shadowMap.enabled = true; // シャドウを有効にする
        this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // PCFShadowMapの結果から更に隣り合う影との間を線形補間して描画する
        this.elms.canvas.appendChild(this.three.renderer.domElement); // HTMLにcanvasを追加
        // this.three.renderer.outputEncoding = THREE.GammaEncoding; // 出力エンコーディングを定義
    }
    setLight(): void {
        // 環境光源(色, 光の強さ)
        const ambientLight = new THREE.AmbientLight(0x666666, 0.5);
        this.three.scene.add(ambientLight);

        //　平行光源(色, 光の強さ)
        // const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.7);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);

        // シャドウニキビを削除
        directionalLight.shadow.normalBias = 0.05;

        // ライトの位置を設定
        directionalLight.position.set(1, 2, 1);

        // 影を有効化
        // directionalLight.castShadow = true;

        // 影のレンダリングサイズの設定
        directionalLight.shadow.mapSize.set(1024, 1024);
        // directionalLight.shadow.mapSize.set(4096, 4096);

        // 平行光源のヘルパー(対象, 大きさ)
        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.8);
        // this.three.scene.add(directionalLightHelper);

        // 影の距離を設定
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 6;

        // カメラの振幅を設定
        directionalLight.shadow.camera.top = 2;
        directionalLight.shadow.camera.right = 2;
        directionalLight.shadow.camera.bottom = -2;
        directionalLight.shadow.camera.left = -2;

        // カメラヘルパーの追加
        // const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        // this.three.scene.add(directionalLightCameraHelper);

        // シーンにライトを追加
        this.three.scene.add(directionalLight);
    }
    setModels(): void {
        // glTF形式の3Dモデルを読み込む
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        // glTF形式の3Dモデルを読み込む
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load(this.srcObj, (obj) => {
            this.three.textRMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'r');
            this.three.textEMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'e');
            this.three.textAMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'a');
            this.three.textCMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'c');
            this.three.textTMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 't');
            this.three.textDotMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'dot');
            this.three.textJMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'j');
            this.three.textSMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 's');

            // // 3dメッシュのサイズ
            // this.three.textRMesh.scale.set(1, 1, 1);
            // this.three.textEMesh.scale.set(0.8, 0.8, 0.8);
            // this.three.textAMesh.scale.set(0.7, 0.7, 0.7);

            // // 3dメッシュの位置
            // this.three.textRMesh.position.set(0, 0, 0);
            // this.three.textEMesh.position.set(this.sp ? -2.3 : -3, 0, 0);
            // this.three.textAMesh.position.set(this.sp ? 2.3 : 3, 0, 0);

            // // 3dメッシュの角度
            // this.three.textRMesh.rotation.set(0, 0, 0);
            // this.three.textEMesh.rotation.set(0, 0, 0);
            // this.three.textAMesh.rotation.set(0, 0, 0);

            // シーンに3Dモデルを追加
            this.three.scene.add(obj.scene);
            // レンダリングを開始する
            this.rendering();
        });
    }
    rendering(): void {
        // 経過時間取得
        const time = this.three.clock.getElapsedTime();

        // this.three.textRMesh.position.y += Math.sin(time) * -0.002;
        // this.three.textEMesh.position.y += Math.sin(time) * 0.003;
        // this.three.textAMesh.position.y += Math.cos(time) * -0.004;

        // this.three.textRMesh.rotation.z += Math.sin(time) * -0.002;
        // this.three.textRMesh.rotation.y += 0.006;
        // this.three.textEMesh.rotation.z += Math.sin(time) * 0.003;
        // this.three.textEMesh.rotation.y -= 0.004;
        // this.three.textAMesh.rotation.z += Math.cos(time) * -0.004;
        // this.three.textAMesh.rotation.y -= 0.008;

        // レンダリングを実行
        this.three.renderer.render(this.three.scene, this.three.camera);
        requestAnimationFrame(this.rendering.bind(this));
        // this.animate(); // アニメーション開始
    }
    animate() {
        gsap.config({
            force3D: true,
        });
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.6,
                ease: 'power2.easeInOut',
            },
        });
        tl.to(this.elmsAll.mvTitle, {
            stagger: 0.05,
            y: 0,
        });
        tl.to(this.elms.canvas, {
            duration: 0.2,
            opacity: 1,
        });
        tl.to(
            this.elms.buttonsWrapper,
            {
                opacity: 1,
                duration: 0.5,
            },
            1.2
        );
        tl.to(
            this.elms.mvHomeLink,
            {
                opacity: 1,
            },
            1.6
        );
        tl.to(
            this.elms.mvNoteLink,
            {
                opacity: 1,
            },
            1.6
        );
        tl.to(
            this.elms.mvGitLink,
            {
                opacity: 1,
            },
            1.6
        );
        tl.play();
    }
    resetModels(): void {
        gsap.to(this.three.textRMesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textEMesh.scale, {
            x: 0.8,
            y: 0.8,
            z: 0.8,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textAMesh.scale, {
            x: 0.7,
            y: 0.7,
            z: 0.7,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textRMesh.position, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textEMesh.position, {
            x: this.sp ? -2.3 : -3,
            y: 0,
            z: 0,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textAMesh.position, {
            x: this.sp ? 2.3 : 3,
            y: 0,
            z: 0,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textRMesh.rotation, {
            x: 0,
            y: 0,
            z: 0,
        });
        gsap.to(this.three.textEMesh.rotation, {
            x: 0,
            y: 0,
            z: 0,
        });
        gsap.to(this.three.textAMesh.rotation, {
            x: 0,
            y: 0,
            z: 0,
        });
    }
    soccerAnimation(): void {
        gsap.to(this.three.textEMesh.scale, {
            x: this.sp ? 1.6 : 2,
            y: this.sp ? 1.6 : 2,
            z: this.sp ? 1.6 : 2,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textEMesh.rotation, {
            x: 4.5,
            y: 4.5,
            z: 4.5,
            duration: 2,
            delay: 1,
        });
    }
    basketballAnimation(): void {
        gsap.to(this.three.textRMesh.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textRMesh.rotation, {
            x: 8.5,
            y: 8.5,
            z: 8.5,
            duration: 1.6,
            delay: 1,
        });
    }
    volleyballAnimation(): void {
        gsap.to(this.three.textAMesh.scale, {
            x: this.sp ? 1.1 : 1.5,
            y: this.sp ? 1.1 : 1.5,
            z: this.sp ? 1.1 : 1.5,
            duration: 1,
            ease: 'power2.easeOut',
        });
        gsap.to(this.three.textAMesh.rotation, {
            x: 3.5,
            y: 3.5,
            z: 3.5,
            duration: 1.6,
            delay: 1,
        });
    }
    handleEvents(): void {
        // リサイズイベント登録
        window.addEventListener(
            'resize',
            throttle(() => {
                this.handleResize();
            }, 100),
            false
        );
        // this.elms.soccerBall.addEventListener('click', () => {
        //     this.resetModels();
        //     this.soccerAnimation();
        // });
        // this.elms.basketBall.addEventListener('click', () => {
        //     this.resetModels();
        //     this.basketballAnimation();
        // });
        // this.elms.volleyBall.addEventListener('click', () => {
        //     this.resetModels();
        //     this.volleyballAnimation();
        // });
    }
    handleResize(): void {
        // リサイズ処理
        this.winSize = {
            wd: window.innerWidth,
            wh: window.innerHeight,
        };
        this.dpr = Math.min(window.devicePixelRatio, 2);
        if (this.three.camera) {
            // カメラの位置更新
            this.three.camera.aspect = this.winSize.wd / this.winSize.wh;
            this.three.camera.updateProjectionMatrix();
        }
        if (this.three.renderer) {
            // レンダラーの大きさ更新
            this.three.renderer.setSize(this.winSize.wd, this.winSize.wh);
            this.three.renderer.setPixelRatio(this.dpr);
        }
    }
}
