import React from 'react'
import styled from 'styled-components'
import { Theme } from '@mui/material'
import { CSSProperties } from 'react'

const Text = styled.span`
  color: var(--text-inverse);
  background: var(--status-warning);
  font-family: var(--font-primary);
  font-size: 1.4rem;
  height: 2rem;
  line-height: 2rem;
  border-radius: var(--radius-full);
  padding: 0 0.6rem;

  ${(props) => props.style}
`

export const BetaLabel = ({
  theme,
  style = {},
}: {
  theme: Theme
  style?: CSSProperties
}) => {
  return (
    <Text theme={theme} style={style}>
      Beta
    </Text>
  )
}
