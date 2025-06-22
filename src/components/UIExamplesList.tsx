'use client'
import { Card } from 'react-bootstrap'
import Gumshoe from 'gumshoejs'
import { useEffect, useRef } from 'react'

import type { UIExamplesListProps } from '@/types/component-props'
import Link from 'next/link'

const UIExamplesList = ({ examples }: UIExamplesListProps) => {
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (navRef.current) new Gumshoe('.docs-nav a')
  }, [])

  return (
    <Card ref={navRef} className="docs-nav">
      <ul className="nav bg-transparent flex-column">
        {examples.map((example, idx) => (
          <li key={example.link + idx} className="nav-item">
            <Link href={example.link} className="nav-link">
              {example.label}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default UIExamplesList
