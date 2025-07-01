import React, { useMemo } from 'react';
import { ReactFlow, Position, Handle, MarkerType } from '@xyflow/react';
import { Cloud, Globe } from 'lucide-react';

import '@xyflow/react/dist/style.css';

const CloudCodeNode = (props: any) => {
    console.log('CloudCodeNode', props);
    const getNodeIcon = useMemo(() => () => {
        switch (props.id) {
            case "cloudcode":
                return <img src="/logo.png" alt="CloudCode Logo" className="w-9 h-9 rounded-lg align-center text-center" />
            case "code-agents":
                return <img src="/ai-logo.webp" alt="CloudCode Logo" className="w-9 h-9 rounded-lg align-center text-center" />
            case "github":
                return <svg role="img" className='w-6 h-6' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            case "rest-api":
                return <Cloud className='w-6 h-6' />
            case "mcp":
                return <img src="/mcp-logo.png" alt="CloudCode Logo" className="w-8 h-8 rounded-lg align-center text-center" />
            case "frontend":
                return <Globe className='w-6 h-6' />
        }
    }, [props.id]);
    return (
        <div className="react-flow__node-default text-center flex flex-col items-center justify-center">
            {getNodeIcon()}
            <div className='text-xs mt-1'><span>{props.data.label}</span></div>
            <Handle type="target" position={Position.Left} id="target-left" />
            <Handle type="source" position={Position.Left} id="source-left" />
            <Handle type="source" position={Position.Top} id="source-top" />
            <Handle type="target" position={Position.Top} id="target-top" />
            <Handle type="source" position={Position.Right} id="source-right" />
            <Handle type="target" position={Position.Right} id="target-right" />
            <Handle type="source" position={Position.Bottom} id="source-bottom" />
            <Handle type="target" position={Position.Bottom} id="target-bottom" />
        </div>
    );
};

const initialNodes = [
    { id: 'rest-api', type: 'cloudcode', position: { x: 0, y: 0 }, data: { label: 'Rest API' }, },
    { id: 'mcp', type: 'cloudcode', position: { x: 0, y: 150 }, data: { label: 'MCP' }, },
    { id: 'frontend', type: 'cloudcode', position: { x: 0, y: 300 }, data: { label: 'Frontend' }, },
    { id: 'cloudcode', type: 'cloudcode', position: { x: 300, y: 150 }, data: { label: 'CloudCode' } },
    { id: 'code-agents', type: 'cloudcode', position: { x: 300, y: 0 }, data: { label: 'Code agents' }, },
    { id: 'github', type: 'cloudcode', position: { x: 600, y: 150 }, data: { label: 'GitHub' }, },
];
const initialEdges = [
    { id: 'rest-api-cloudcode', animated: true, source: 'rest-api', target: 'cloudcode', sourceHandle: 'source-right', targetHandle: 'target-left', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
    { id: 'mcp-cloudcode', animated: true, source: 'mcp', target: 'cloudcode', sourceHandle: 'source-right', targetHandle: 'target-left', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
    { id: 'frontend-cloudcode', animated: true, source: 'frontend', target: 'cloudcode', sourceHandle: 'source-right', targetHandle: 'target-left', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
    { id: 'cloudcode-code-agents', type: 'bezier', animated: true, source: 'cloudcode', target: 'code-agents', sourceHandle: 'source-top', targetHandle: 'target-left', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
    { id: 'code-agents-cloudcode', type: 'bezier', animated: true, source: 'code-agents', target: 'cloudcode', sourceHandle: 'source-right', targetHandle: 'target-top', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
    { id: 'cloudcode-github', animated: true, source: 'cloudcode', target: 'github', sourceHandle: 'source-right', targetHandle: 'target-left', markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }, style: { strokeWidth: 1 } },
];

const nodeTypes = {
    cloudcode: CloudCodeNode,
};

export default function FlowDiagram() {
    return (
        <div style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
            <ReactFlow
                nodes={initialNodes}
                edges={initialEdges}
                nodeTypes={nodeTypes}
                fitView
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                panOnScroll={false}
                panOnDrag={false}
                selectionOnDrag={false}
                selectNodesOnDrag={false}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                defaultEdgeOptions={{
                    type: 'bezier',
                    animated: true,
                }}
                width={1000}
                height={1000}
                fitViewOptions={{
                    padding: 0.7,
                }}
            />
        </div>
    );
}