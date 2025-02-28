/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-invalid-this */

'use strict';

/**
 *
 * @module StreamDeckV2
 */
class StreamDeckV2 { // eslint-disable-line
//  static PRODUCT_ID = 0x006d;
  static PRODUCT_ID = 0x0080;

  /*
    3 rows with 5 buttons
    Top Left =  0,
    Bottom Right = 14
  */

  buttonNameToIdMap = {
    // All rooms
//    'fullscreen-on': 2,
//    'fullscreen-off': 2,
//    'fullscreen-disabled': 2,

    // Lobby
    'start-next': 5,
    'start-instant': 6,

    // Green Room
    'enter-meeting': 5,
    'mic': 10,
    'mic-disabled': 10,
    'cam': 11,
    'cam-disabled': 11,

    // Meeting
    'reaction': 0,
    'reaction-open': 0,


    'heart': -1,
    'thumbUp': 2,
    'partyPopper': 1,
    'clap': -1,
    'joy': 3,
    'astonish': -1,
    'cry': -1,
    'think': -1,
    'thumbDown': -1,
    'plus': -1,
    'crab': 4,


    'info': 5,
    'info-open': 5,
    'users': 6,
    'users-open': 6,
    'cc': 7,
    'cc-on': 7,
    'activities': 8,
    'activities-open': 8,
//    'present-stop': 9,
//    'blank': 9,
    'chat': 12,
    'chat-open': 12,
    'hand': 13,
    'hand-raised': 13,
    'end-call': 14,

    // Exit Hall
    'home': 14,
    'rejoin': 10,
  };

  OFFSET = 4;
  ID_OFFSET = 0;
  NUM_KEYS = 15;
  ICON_SIZE = 72;
  ICON_SIZE_HALF = this.ICON_SIZE / 2;
  IMAGE_ROTATION = 180;
  HRZFLIP = 0;

  #PACKET_SIZE = 1024;
  #PACKET_HEADER_LENGTH = 8;
  #MAX_PAYLOAD_LENGTH = this.#PACKET_SIZE - this.#PACKET_HEADER_LENGTH;

  /**
   * Constructor
   */
  constructor() {
    console.log("in StreamDeckV2.js constructor()");
//    let {MeetButtonOne = Object.keys(MeetButtonOne)} = chrome.storage.sync.get('MeetButtonOne');
//    console.log("MeetButtonOne", MeetButtonOne);

//    chrome.storage.sync.get(console.log);
//    ButtonOne = chrome.storage.sync.get(["MeetButtonOne"]);
//    chrome.storage.sync.get(function(result){ButtonOne = result.MeetButtonOne)});
//    console.log("MeetButtonOne: ", chrome.storage.sync.get(["MeetButtonOne"]));
//    buttonNameToIdMap.set(chrome.storage.sync.get(["MeetButtonOne"]), 1);

//    chrome.storage.sync.get(
//      {MeetButtonOne: MeetButtonOne}, (items) => {
//        console.log("MeetButtonOne", items.MeetButtonOne);
//        buttonNameToIdMap.set(items.MeetButtonOne, 1);
//      }
//    );
//    console.log("buttonNameToIdMap", buttonNameToIdMap);
  };

  /**
   * Set the brightness of the StreamDeck panel.
   *
   * @param {object} device StreamDeck device object
   * @param {number} percentage 1-100
   * @return {?Promise<ArrayBuffer>}
   */
  setBrightness(device, percentage) {
    const data = new Uint8Array([0x08, percentage]);
    return device.sendFeatureReport(0x03, data);
  }

  /**
   * Reset the StreamDeck device.
   *
   * @param {object} device StreamDeck device object
   * @return {?Promise<ArrayBuffer>}
   */
  async reset(device) {
    const data = new Uint8Array([0x02]);
    return device.sendFeatureReport(0x03, data);
  }

  /**
   * Generate an image buffer from the supplied canvas.
   *
   * @param {Canvas} canvas Canvas element to use, should be 72px x 72px
   * @return {Promise<ArrayBuffer>}
   */
  async getImageBufferFromCanvas(canvas) {
    const blob = await canvas.convertToBlob({type: 'image/jpeg', quality: 1.0});
    const buff = await blob.arrayBuffer();
    return buff;
  }

  /**
   * Generates the packets to needed to draw the image on the specified button.
   *
   * @param {number} buttonId Button ID to draw the image on.
   * @param {ArrayBuffer} buffer Image buffer.
   * @return {!array}
   */
  getPacketsFromBuffer(buttonId, buffer) {
    const packets = [];

    let page = 0;
    let start = 0;
    let bytesRemaining = buffer.byteLength;

    while (bytesRemaining > 0) {
      const byteCount = Math.min(bytesRemaining, this.#MAX_PAYLOAD_LENGTH);
      const isLastPacket = bytesRemaining <= this.#MAX_PAYLOAD_LENGTH;
      const header = new ArrayBuffer(this.#PACKET_HEADER_LENGTH);

      new DataView(header).setUint8(0, 0x02); // report ID
      new DataView(header).setUint8(1, 0x07); // always 7 - set the icon
      new DataView(header).setUint8(2, buttonId); // button
      new DataView(header).setUint8(3, isLastPacket ? 1 : 0); // is last packet
      new DataView(header).setUint16(4, byteCount, true);
      new DataView(header).setUint16(6, page++, true);

      const end = start + byteCount;
      const packet = new Uint8Array(this.#PACKET_SIZE);
      packet.set(new Uint8Array(header));
      packet.set(
          new Uint8Array(buffer.slice(start, end)),
          this.#PACKET_HEADER_LENGTH,
      );

      start = end;
      bytesRemaining = bytesRemaining - byteCount;

      packets.push(packet);
    }
    return packets;
  }
}
