import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { vpet } from './rom-core';

export const wait_ms = (ms:number) => new Promise(res => setTimeout(res, ms));
export const wait_ms_blocking = (ms:number) => {let t = Date.now()+ms; while(Date.now() < t);};

@Injectable({
  providedIn: 'root'
})
export class SerialService {
  public port: any;
  private readonly baud_rate = 9600;
  private readableStreamClosed: any;
  private writableStreamClosed: any;
  public writer: any;
  public reader: any;
  public hasPort: number = 0;
  public isPortOpen: boolean = false;
  public isPortInitialised: boolean = false;
  public count: number = 0;
  public portListen: boolean = false;

  public serial_status!: Subject<boolean>;
  public serial_output!: Subject<string>;

  public output_subscription_references: Array<Subscription> = [];

  constructor() {
    this.serial_status = new Subject();
    this.serial_output = new Subject();
  }
  
  public getPort() {
    this.hasPort = 0;
    return new Promise(async (resolve, reject) => {
      try {
        this.port = await window.navigator.serial.requestPort();
        this.hasPort = 1;
        resolve("OK");
      } catch (error) {
        this.hasPort = -1;
        reject()
      }
    });
  }
  public openPort() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.port.open({ 
          baudRate: this.baud_rate, 
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          bufferSize: 16,
          flowControl: "none"
        });
        this.isPortOpen = true;
        this.count = 0;
        resolve("OK");
      } catch (error) {
        this.hasPort = -1;
        reject(error);
      }
    });
  }
  public initialisePort() {
    return new Promise(async (resolve, reject) => {
      try {
        const textEncoder = new TextEncoderStream();
        this.writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
        this.writer = textEncoder.writable.getWriter();
        
        const textDecoder = new TextDecoderStream();
        this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();
        let buffer = "";
  
        let countt = 0;
        setTimeout(() => {
          this.sendSerial("p\n");
        }, 2500);
        
        const timeout = Date.now()+5100;
        setTimeout(() => {
          if(!this.isPortInitialised) this.closePort();
        }, 5000);
        while(!buffer.includes('\n')) {
          if(Date.now() > timeout) {
            reject("BADCOM");
            return;
          }
          buffer += (await this.reader.read()).value;
        }

        this.isPortInitialised = true;
        console.log("Port Initialised");
        resolve("OK");
        this.serial_status.next(true);
      } catch(error) {
        this.closePort();
        this.hasPort = -1;
        reject(error);
      }
    });
  }
  public async listenToSerialPort() {
    // Get > Open > Initialise > Listen > Close
    console.log("Listening to Serial");
    try {
      let buffer = "";

      // Listen to data coming from the serial device.
      this.portListen = true;
      while(this.portListen) {  
        buffer = "";
        while(!buffer.includes('\n')) buffer += (await this.reader.read()).value;
        if(buffer.length < 5) continue;
        this.serial_output.next(buffer);
      }
    } catch (error) {
      if(this.portListen) console.log("An issue occurred while trying to read the Serial Port.", error);
      this.portListen = false;
    }
    finally {
      await this.reader.releaseLock();
      console.log("Serial listen loop lock released.");
    }
  }
  public sendSerial(message: string) {
    try {
        this.writer.write(message);
    } catch {
        console.log("Serial Failed to Send:", message);
    }
  }
  public closePort() {
    return new Promise(async (resolve, reject) => {
      try {
        if(this.hasPort) {
          if(this.writer !== undefined) {
            await this.writer.close();
            await this.writableStreamClosed
          }
    
          if(this.reader !== undefined){
            await this.reader.cancel();
            await this.readableStreamClosed.catch(() => {});
          }
            
          if(this.port !== undefined) 
            await this.port.close();

          this.isPortInitialised = false;
          this.isPortOpen = false;
          this.hasPort = 0;
          this.count = 0;
          console.log("Serial Port Closed.");
          this.serial_status.next(false);
          this.clearSerialSubscriptions();
          resolve("OK");
        }
      } catch (error) {
        console.log("Failed to close Serial Port.", error);
        reject("Failed to close Serial Port.");
      }
    });
    
  }
  public openReader = (l: boolean = false) => {
    try {
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();
      this.isPortOpen = true;
      this.count = 0;
      if(l) console.log("OPENED");
    } catch (error) {
      console.log("Failed to open reader.", error);
    }
  }
  public closeReader = async (l: boolean = false) => {
    try {
      await this.reader.cancel();
      await this.readableStreamClosed.catch(() => {});
      this.isPortOpen = false;
      if(l) console.log("CLOSED");  
    } catch (error) {
      console.log("Failed to close reader.", error);
    }
  }

  public async *readSerialData() {
    let buffer = '';
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) {
        console.log('Read loop done');
        this.reader.releaseLock();
        break;
      }
      buffer += value;
      if (buffer.includes('\n')) {
        const lines = buffer.split('\n');
        buffer = lines.pop() as string;
        for (const line of lines) {
          yield line;
        }
      }
    }
  }
  public async listenToSerialPortTwo() {
    console.log('Listening to Serial');
    try {
      const serialData = this.readSerialData();
      this.portListen = true;
      for await (const line of serialData) {
        if (line.length < 5) continue;
        this.serial_output.next(line);
      }
    } catch (error) {
      if (this.portListen) console.log('An issue occurred while trying to read the Serial Port.', error);
      this.portListen = false;
    } finally {
      await this.reader.releaseLock();
      console.log('Serial listen loop lock released.');
    }
  }
  public clearSerialSubscriptions() {
    this.output_subscription_references.forEach(sub => sub.unsubscribe());
    this.output_subscription_references = [];
  }


  public getComLine() {
    return new Promise<string>((resolve, reject) => {
      const sub = this.serial_output.pipe(
        filter((value) => value.includes('r')),
        take(1)
      ).subscribe({
        next: (value) => {
          resolve(value);
        }
      });
      this.output_subscription_references.push(sub);
    });
  }
  public getComLineFake() {
    return new Promise<string>((resolve, reject) => {
      const t = Math.random() > 0.5 ? "2" : "1";
      setTimeout(() => resolve("s:FC03 r:FC03 s:FD02 r:FD0"+t), 2500);
    });
  }
}
