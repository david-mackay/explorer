'use client'

import {
  SigmaContainer,
  useCamera,
  useLoadGraph,
  useRegisterEvents,
} from '@react-sigma/core'
import Graph from 'graphology'
import { useCallback, useEffect, useState } from 'react'
import {
  EDGE_SIZE,
  NODE_SIZE,
  NODE_SIZE_CURRENT_USER,
  NODE_SIZE_PROFILE,
} from '../social-graph.constants'

import { SocialGraphControls } from './SocialGraphControls'
import { SocialGraphLayout } from './SocialGraphLayout'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import type {
  IGraph,
  INode,
} from '@/components/graph-visualization/social-graph/social-graph.models'

interface Props {
  data: IGraph
  username: string
  setCurrentUsername: (username?: string) => void
}

function SocialGraphContent({ data, username, setCurrentUsername }: Props) {
  const loadGraph = useLoadGraph()
  const registerEvents = useRegisterEvents()
  const { mainUsername } = useCurrentWallet()
  const { zoomIn, gotoNode } = useCamera()

  const isProfileNode = useCallback(
    (node: INode) => node.caption === username,
    [username],
  )

  const isOwnNode = useCallback(
    (node: INode) => node.caption === mainUsername,
    [mainUsername],
  )

  const getNodeSize = useCallback(
    (node: INode) => {
      if (isProfileNode(node)) {
        return NODE_SIZE_PROFILE
      }

      if (isOwnNode(node)) {
        return NODE_SIZE_CURRENT_USER
      }

      return NODE_SIZE
    },
    [isProfileNode, isOwnNode],
  )

  const getBackgroundColor = useCallback(
    (node: INode) => {
      if (isProfileNode(node)) {
        return '#ffd966' // yellow
      }

      if (isOwnNode(node)) {
        return '#cc66ff' // purple
      }

      return '#ffffff' // white
    },
    [isProfileNode, isOwnNode],
  )

  useEffect(() => {
    const graph = new Graph()

    data?.nodes.forEach((node) => {
      graph.addNode(node.id, {
        size: getNodeSize(node),
        label: node.caption,
        color: getBackgroundColor(node),
      })
    })

    data?.rels.forEach((rel) => {
      graph.addEdge(rel.from, rel.to, {
        type: 'arrow',
        size: EDGE_SIZE,
        // color: 'rgba(255, 255, 255, 0.1)',
      })
    })

    graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / graph.order
      graph.setNodeAttribute(node, 'x', 100 * Math.cos(angle))
      graph.setNodeAttribute(node, 'y', 100 * Math.sin(angle))
    })

    registerEvents({
      clickNode: (event) => {
        const nodeId = event.node
        const nodeData = graph.getNodeAttributes(nodeId)

        gotoNode(nodeId)
        // zoomIn({
        //   duration: 500,
        //   factor: 10,
        // })
        setCurrentUsername(nodeData.label)
      },
      clickStage: () => {
        setCurrentUsername(undefined)
      },
      enterNode: () => {
        document.body.style.cursor = 'pointer'
      },
      leaveNode: () => {
        document.body.style.cursor = 'default'
      },
    })

    loadGraph(graph)
  }, [
    loadGraph,
    data,
    getBackgroundColor,
    isProfileNode,
    isOwnNode,
    registerEvents,
    setCurrentUsername,
    getNodeSize,
    gotoNode,
    zoomIn,
  ])

  return null
}

export default function SocialGraph({
  data,
  username,
}: Omit<Props, 'setCurrentUsername'>) {
  const [currentUsername, setCurrentUsername] = useState<string>()

  return (
    <SigmaContainer
      className="w-full h-full !bg-transparent"
      settings={{
        allowInvalidContainer: true,
        renderLabels: false,
      }}
    >
      <SocialGraphContent
        data={data}
        username={username}
        setCurrentUsername={setCurrentUsername}
      />
      <SocialGraphLayout />
      <SocialGraphControls />
    </SigmaContainer>
  )
}
