export class NFCManager {
  constructor() {
    this.supported = 'NDEFReader' in window;
    this.reader = null;
  }

  async initialize() {
    if (!this.supported) {
      console.log('NFC not supported on this device');
      return false;
    }
    
    try {
      this.reader = new NDEFReader();
      await this.reader.scan();
      return true;
    } catch (error) {
      console.log('Error initializing NFC:', error.message);
      return false;
    }
  }

  async writeUrl(url) {
    if (!this.supported || !this.reader) {
      return false;
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
      console.log('Error writing to NFC:', error.message);
      return false;
    }
  }
}