import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SceneCardCustom } from './SceneCardCustom';
import type { Scene } from '../../../roomsStore';

export function SceneFlowNode({ data }: NodeProps<{ scene: Scene }>) {
  const scene = data.scene;
  return (
    <div style={{ background: 'transparent' }}>
      <SceneCardCustom scene={scene} />

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
}