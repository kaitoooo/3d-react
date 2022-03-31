import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import throttle from 'lodash.throttle';
import gsap from 'gsap';

const WebGL: React.VFC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    const winSize = {
        wd: window.innerWidth,
        wh: window.innerHeight,
    };
    const three = {
        scene: new THREE.Scene(),
        clock: new THREE.Clock(),
        camera: new THREE.PerspectiveCamera(75, winSize.wd / winSize.wh, window.innerWidth / window.innerHeight, 100),
        renderer: new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        }),
        textRMesh: new THREE.Mesh(),
        textEMesh: new THREE.Mesh(),
        textAMesh: new THREE.Mesh(),
        textCMesh: new THREE.Mesh(),
        textTMesh: new THREE.Mesh(),
        textDotMesh: new THREE.Mesh(),
        textJMesh: new THREE.Mesh(),
        textSMesh: new THREE.Mesh(),
    };
    const dpr = Math.min(window.devicePixelRatio, 2);
    const srcObj = './obj/react-d.glb';
    const ua = window.navigator.userAgent.toLowerCase();
    const mq = window.matchMedia('(max-width: 768px)');
    const sp = mq.matches ? true : false;

    useEffect(() => {
        getLayout();
        // initRenderer
        const elm = mountRef.current;
        three.renderer.setPixelRatio(window.devicePixelRatio);
        three.renderer.setSize(winSize.wd, winSize.wh);
        three.renderer.setPixelRatio(dpr); // retina対応
        three.renderer.setSize(winSize.wd, winSize.wh); // 画面サイズをセット
        three.renderer.physicallyCorrectLights = true;
        three.renderer.shadowMap.enabled = true; // シャドウを有効にする
        three.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // PCFShadowMapの結果から更に隣り合う影との間を線形補間して描画する
        elm?.appendChild(three.renderer.domElement);
        // カメラ設定
        setCamera();
        // ライト設定
        setLight();
        // 3Dメッシュ設定
        setModels();
        // イベントリスナー設定
        handleEvents();

        if (ua.indexOf('msie') !== -1 || ua.indexOf('trident') !== -1) {
            return;
        } else {
            mq.addEventListener('change', getLayout.bind(this));
        }
        return () => {
            elm?.removeChild(three.renderer.domElement);
        };
    }, []);

    const getLayout = (): void => {
        sp;
    };
    const setCamera = (): void => {
        three.camera.position.set(0, 0, 9);
    };
    const setLight = (): void => {
        // 環境光源(色, 光の強さ)
        const ambientLight = new THREE.AmbientLight(0x666666, 0.5);
        three.scene.add(ambientLight);

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
        // three.scene.add(directionalLightHelper);

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
        // three.scene.add(directionalLightCameraHelper);

        // シーンにライトを追加
        three.scene.add(directionalLight);
    };
    const tick = (): void => {
        const time = three.clock.getElapsedTime();

        three.textRMesh.position.y += Math.sin(time) * -0.002;
        three.textEMesh.position.y += Math.sin(time) * 0.003;
        three.textAMesh.position.y += Math.cos(time) * -0.004;
        three.textCMesh.position.y += Math.sin(time) * -0.0025;
        three.textTMesh.position.y += Math.cos(time) * 0.005;
        three.textDotMesh.position.y += Math.cos(time) * -0.0025;
        three.textJMesh.position.y += Math.sin(time) * -0.0045;
        three.textSMesh.position.y += Math.cos(time) * -0.0035;
        three.renderer.render(three.scene, three.camera);
        requestAnimationFrame(tick);
        animate();
    };
    const setModels = (): void => {
        // glTF形式の3Dモデルを読み込む
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        // glTF形式の3Dモデルを読み込む
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load(srcObj, (obj) => {
            three.textRMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'r');
            three.textEMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'e');
            three.textAMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'a');
            three.textCMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'c');
            three.textTMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 't');
            three.textDotMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'dot');
            three.textJMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 'j');
            three.textSMesh = obj.scene.children.find((child: THREE.Mesh) => child.name === 's');

            // // 3dメッシュのサイズ
            three.textRMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textEMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textAMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textCMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textTMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textDotMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textJMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);
            three.textSMesh.scale.set(sp ? 1 : 1.6, sp ? 1 : 1.6, sp ? 1 : 1.6);

            // // 3dメッシュの位置
            three.textRMesh.position.set(-3.5, 0, 0);
            three.textEMesh.position.set(-2.5, 0, 0);
            three.textAMesh.position.set(-1.5, 0, 0);
            three.textCMesh.position.set(-0.5, 0, 0);
            three.textTMesh.position.set(0.5, 0, 0);
            three.textDotMesh.position.set(sp ? 1.3 : 1.5, 0, 0);
            three.textJMesh.position.set(sp ? 1.8 : 2.5, 0, 0);
            three.textSMesh.position.set(sp ? 2.7 : 3.5, 0, 0);

            // シーンに3Dモデルを追加
            three.scene.add(obj.scene);
            // レンダリングを開始する
            tick();
        });
    };
    const animate = (): void => {
        gsap.config({
            force3D: true,
        });
        gsap.to(three.textRMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
        });
        gsap.to(three.textEMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
            delay: 0.3,
        });
        gsap.to(three.textAMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
            delay: 0.6,
        });
        gsap.to(three.textCMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
            delay: 0.9,
        });
        gsap.to(three.textTMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
            delay: 1.2,
        });
        gsap.to(three.textDotMesh.rotation, {
            duration: 2.5,
            z: 6,
            ease: 'power2.easeOut',
            delay: 1.5,
        });
        gsap.to(three.textJMesh.rotation, {
            duration: 2.5,
            z: 6.2,
            ease: 'power2.easeOut',
            delay: 1.8,
        });
        gsap.to(three.textSMesh.rotation, {
            duration: 2.5,
            z: 6.4,
            ease: 'power2.easeOut',
            delay: 2.1,
        });
        gsap.to(three.textRMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 2,
        });
        gsap.to(three.textRMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 2,
        });
        gsap.to(three.textEMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 2.3,
        });
        gsap.to(three.textEMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 2.3,
        });
        gsap.to(three.textAMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 2.6,
        });
        gsap.to(three.textAMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 2.6,
        });
        gsap.to(three.textCMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 2.9,
        });
        gsap.to(three.textCMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 2.9,
        });
        gsap.to(three.textTMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 3.2,
        });
        gsap.to(three.textTMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 3.2,
        });
        gsap.to(three.textDotMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 3.5,
        });
        gsap.to(three.textDotMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 3.5,
        });
        gsap.to(three.textJMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 3.8,
        });
        gsap.to(three.textJMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 3.8,
        });
        gsap.to(three.textSMesh.scale, {
            duration: 1,
            x: 2,
            y: 2,
            z: 2,
            delay: 4.1,
        });
        gsap.to(three.textSMesh.position, {
            duration: 1,
            z: sp ? 1 : 2,
            delay: 4.1,
        });
    };
    const handleEvents = (): void => {
        // リサイズイベント登録
        window.addEventListener(
            'resize',
            throttle(() => {
                handleResize();
            }, 100),
            false
        );
    };
    const handleResize = (): void => {
        // リサイズ処理
        winSize.wd = window.innerWidth;
        winSize.wh = window.innerHeight;

        if (three.camera) {
            // カメラの位置更新
            three.camera.aspect = winSize.wd / winSize.wh;
            three.camera.updateProjectionMatrix();
        }
        if (three.renderer) {
            // レンダラーの大きさ更新
            three.renderer.setSize(winSize.wd, winSize.wh);
            three.renderer.setPixelRatio(dpr);
        }
    };

    return (
        <section className="mv">
            <div ref={mountRef} />
            <div className="mv__links">
                <a href="/" className="mv__link" data-hover="Home">
                    Home
                </a>
                <a href="https://github.com/kaitoooo/3d-react" target="_blank" rel="noopener noreferrer" className="mv__link" data-hover="GitHub">
                    GitHub
                </a>
            </div>
        </section>
    );
};

export default WebGL;
