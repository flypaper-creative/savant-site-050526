import * as THREE from 'three';
import { ShardRenderPacket } from './render-packet';

export class ThreeRendererAdapter {
  private scene: THREE.Scene;
  private objects: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(packets: ShardRenderPacket[]) {
    packets.forEach(packet => {
      let obj = this.objects.get(packet.shardId);
      
      if (!obj) {
        // Create object based on packet geometry/material
        obj = this.createObject(packet);
        this.scene.add(obj);
        this.objects.set(packet.shardId, obj);
      }

      if (packet.transform) {
        obj.position.set(...packet.transform.position);
        obj.rotation.set(...packet.transform.rotation);
        obj.scale.set(...packet.transform.scale);
      }

      obj.visible = packet.visible;
      // Handle opacity/materials if needed
    });
  }

  private createObject(packet: ShardRenderPacket): THREE.Object3D {
    // Basic implementation: defaults to a small sphere for motion shards
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00a2 });
    return new THREE.Mesh(geometry, material);
  }
}
