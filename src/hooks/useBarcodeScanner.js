import { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';

const PREFERRED_CAMERA_KEY = 'nutriar_preferred_camera_v1';

export const useBarcodeScanner = ({ onDetected, scannerEnabled = true }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  
  const lastScanTime = useRef(0);
  const isInitialized = useRef(false);
  const quaggaActive = useRef(false);
  const scannerRef = useRef(null);

  // Load available camera devices
  const loadDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);

      // Restore preference or find best back camera
      const savedDeviceId = localStorage.getItem(PREFERRED_CAMERA_KEY);
      const savedIndex = videoDevices.findIndex(d => d.deviceId === savedDeviceId);

      if (savedIndex !== -1) {
        setCurrentDeviceIndex(savedIndex);
      } else {
        const backIndex = videoDevices.findIndex(d =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment") ||
          d.label.toLowerCase().includes("rear")
        );
        setCurrentDeviceIndex(backIndex !== -1 ? backIndex : 0);
      }
    } catch (err) {
      console.error("Failed to load camera devices", err);
    }
  }, []);

  const initQuagga = useCallback((deviceId) => {
    const scannerElement = document.querySelector('#scanner');
    if (!scannerElement) return;

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: deviceId ? undefined : 'environment',
          },
          target: scannerElement,
        },
        locator: { patchSize: 'medium', halfSample: true },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: ['ean_reader', 'upc_reader', 'ean_8_reader', 'upc_e_reader'],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error('Quagga init failed:', err);
          setError(err);
          setIsInitializing(false);
          return;
        }
        isInitialized.current = true;
        if (scannerEnabled) {
          Quagga.start();
          quaggaActive.current = true;
        }
        setIsInitializing(false);
      }
    );
  }, [scannerEnabled]);

  const restartScanner = useCallback((deviceId) => {
    try {
      // Per user request: avoid full re-init if possible, 
      // but in Quagga2, updating constraints requires a fresh init call for the new stream.
      // We stop the current session first.
      if (quaggaActive.current) {
        Quagga.stop();
        quaggaActive.current = false;
      }
      
      initQuagga(deviceId);
      localStorage.setItem(PREFERRED_CAMERA_KEY, deviceId);
    } catch (err) {
      console.error("Camera switch failed", err);
    }
  }, [initQuagga]);

  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return;

    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    
    const nextDevice = devices[nextIndex];
    restartScanner(nextDevice.deviceId);
  }, [devices, currentDeviceIndex, restartScanner]);

  const startScanner = useCallback(() => {
    if (isInitialized.current && !quaggaActive.current) {
      Quagga.start();
      quaggaActive.current = true;
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (isInitialized.current && quaggaActive.current) {
      Quagga.stop();
      quaggaActive.current = false;
    }
  }, []);

  // Initial setup
  useEffect(() => {
    loadDevices().then(() => {
      // The devices state might not be updated yet, so we use the local variable in loadDevices 
      // or we let another useEffect handle the initial Quagga init based on currentDeviceIndex.
    });

    const handleDetected = (data) => {
      if (!data || !data.codeResult || !data.codeResult.code) return;
      const code = data.codeResult.code;
      const now = Date.now();
      if (now - lastScanTime.current < 2000) return;
      lastScanTime.current = now;
      if (navigator.vibrate) navigator.vibrate(100);
      onDetected(code);
    };

    Quagga.onDetected(handleDetected);

    return () => {
      if (isInitialized.current) {
        Quagga.stop();
      }
      Quagga.offDetected(handleDetected);
      isInitialized.current = false;
      quaggaActive.current = false;
    };
  }, [loadDevices, onDetected]);

  // Initial Quagga Init once devices are loaded
  useEffect(() => {
    if (devices.length > 0 && !isInitialized.current) {
      initQuagga(devices[currentDeviceIndex].deviceId);
    }
  }, [devices, currentDeviceIndex, initQuagga]);

  // Toggle start/stop based on scannerEnabled prop
  useEffect(() => {
    if (scannerEnabled) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scannerEnabled, startScanner, stopScanner]);

  return { 
    isInitializing, 
    error, 
    devices, 
    currentDeviceIndex, 
    switchCamera,
    startScanner,
    stopScanner
  };
};
