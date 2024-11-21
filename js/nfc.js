export class NFCManager {
  constructor() {
    this.supported = 'NDEFReader' in window;
  }

  async initialize() {
    if (!this.supported) {
      throw new Error('NFC not supported on this device');
    }
    
    try {
      this.reader = new NDEFReader();
      await this.reader.scan();
      return true;
    } catch (error) {
      console.error('Error initializing NFC:', error);
      return false;
    }
  }

  async writeUrl(url) {
    if (!this.supported) {
      throw new Error('NFC not supported');
    }

    try {
      await this.reader.write({
        records: [{
          recordType: "url",
          data: url
        }]
      });
      return true;
    } catch (error) {
      console.error('Error writing to NFC:', error);
      return false;
    }
  }
}