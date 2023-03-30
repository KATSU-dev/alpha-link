import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import * as mqtt from 'precompiled-mqtt';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client!: mqtt.Client;
  private readonly brokerUrl = 'wss://www.alphalink.app:8883';
  // private readonly brokerUrl = 'wss://test.mosquitto.org:8081';
  public isConnected: boolean = false;
  public doAutoReconnect: boolean = true;
  private topics: Array<string> = [];
  private callbacks: Array<Function> = [];

  constructor(session: SessionService) {
    setTimeout(() => {
      this.connectToBroker();
    }, 1250);
  }

  private connectToBroker() {
    return new Promise((resolve, reject) => {
      try {
        if(this.isConnected) return resolve("OK");

        this.client = mqtt.connect(this.brokerUrl, {rejectUnauthorized: false});
        this.client.on('connect', () => {
          console.log('Client Connected');
          this.isConnected = true;
          resolve("OK");
        });

        this.client.on('disconnect', () => {
          this.isConnected = false;
          console.log("Client Disconnected");
        });
    
        this.client.on('message', (topic, message) => {
          if(!this.topics.includes(topic) || this.topics.length == 0 || this.callbacks.length == 0) {
            console.log("Bad Topic", topic, message.toString());
            return;
          }
          this.callbacks[this.topics.indexOf(topic)](message.toString());
        });

      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  public listenToTopic(topic: string, callback: Function) {
    console.log("Listen To:", topic);
    if(!this.topics.includes(topic)) {
      this.client.subscribe(topic);
      this.topics.push(topic);
      this.callbacks.push(callback);
    }
    else 
      this.callbacks[this.topics.indexOf(topic)] = callback;
  }
  public disconnectListener(topic: string) {
    if(!this.topics.includes(topic)) return;
    const ind = this.topics.indexOf(topic);
    this.callbacks.splice(ind, 1);
    this.topics.splice(ind, 1);
    this.client.unsubscribe(topic);
  }

  public sendMessage(topic: string, message: string) {
    if(!this.isConnected) return;
    this.client.publish(topic, message);
  }

  public sendAndAwaitResponse(topic: string, responseTopic: string, message: string, timeout:number=2000) {
    return new Promise<string>((resolve, reject) => {
      if(!this.isConnected) return reject("not-connected");
      let status: number = 0;

      this.sendMessage(topic, message);
      const t = Date.now();
      console.time("A");

      setTimeout(() => {
        if(status != 1) {
          status = -1;
          this.disconnectListener(responseTopic);
          reject(-1)
          console.timeEnd("A");
          console.log("MQTT Await Timed Out :(");
        }
      }, timeout);

      this.listenToTopic(responseTopic, (response: string) => {
        if(status < 0) return;
        status = 1;
        this.disconnectListener(responseTopic);
        resolve(response);
        console.timeEnd("A");
        console.log("MQTT Await Successful :)");
      });
    });
  }
}
