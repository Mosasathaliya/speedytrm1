'use client';

class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
    this.enabled = typeof window !== 'undefined' && window.performance;
  }

  startMeasurement(name) {
    if (!this.enabled) return;
    
    const measurementId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.measurements.set(measurementId, {
      name,
      startTime: performance.now(),
      startMark: `${measurementId}_start`
    });
    
    performance.mark(`${measurementId}_start`);
    return measurementId;
  }

  endMeasurement(measurementId) {
    if (!this.enabled || !measurementId || !this.measurements.has(measurementId)) {
      return null;
    }

    const measurement = this.measurements.get(measurementId);
    const endTime = performance.now();
    const duration = endTime - measurement.startTime;
    
    const endMark = `${measurementId}_end`;
    performance.mark(endMark);
    
    try {
      performance.measure(
        `${measurement.name}_measure`,
        measurement.startMark,
        endMark
      );
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }

    const result = {
      name: measurement.name,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      startTime: measurement.startTime,
      endTime: endTime
    };

    this.measurements.delete(measurementId);
    
    // Log slow operations
    if (duration > 1000) { // More than 1 second
      console.warn(`Slow operation detected: ${measurement.name} took ${result.duration}ms`);
    }

    return result;
  }

  measureAsync(name, asyncFunction) {
    return new Promise(async (resolve, reject) => {
      const measurementId = this.startMeasurement(name);
      
      try {
        const result = await asyncFunction();
        const measurement = this.endMeasurement(measurementId);
        
        if (measurement) {
          console.log(`Performance: ${measurement.name} completed in ${measurement.duration}ms`);
        }
        
        resolve(result);
      } catch (error) {
        this.endMeasurement(measurementId);
        reject(error);
      }
    });
  }

  measureSync(name, syncFunction) {
    const measurementId = this.startMeasurement(name);
    
    try {
      const result = syncFunction();
      const measurement = this.endMeasurement(measurementId);
      
      if (measurement) {
        console.log(`Performance: ${measurement.name} completed in ${measurement.duration}ms`);
      }
      
      return result;
    } catch (error) {
      this.endMeasurement(measurementId);
      throw error;
    }
  }

  getNavigationTiming() {
    if (!this.enabled) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return null;

    return {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      totalPageLoad: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      dnslookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcpConnect: Math.round(navigation.connectEnd - navigation.connectStart),
      serverResponse: Math.round(navigation.responseEnd - navigation.responseStart)
    };
  }

  getMemoryUsage() {
    if (!this.enabled || !performance.memory) return null;

    return {
      usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
      totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
      jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
    };
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      navigationTiming: this.getNavigationTiming(),
      memoryUsage: this.getMemoryUsage(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : null
    };

    console.log('Performance Report:', report);
    return report;
  }

  // AI-specific performance measurements
  measureAIResponse(aiType, messageText) {
    return this.measureAsync(`AI_${aiType}_Response`, async () => {
      // This would be called around AI API calls
      return { aiType, messageLength: messageText.length };
    });
  }

  measureAudioProcessing(processingType) {
    return this.measureAsync(`Audio_${processingType}`, async () => {
      // This would be called around audio processing
      return { processingType };
    });
  }

  measureTranslation(sourceText) {
    return this.measureAsync('Translation_Processing', async () => {
      // This would be called around translation operations
      return { sourceLength: sourceText.length };
    });
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
