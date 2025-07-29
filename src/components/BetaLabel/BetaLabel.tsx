import React from 'react'
import styled from 'styled-components'
import { Theme } from '@mui/material'

type TextProps = {
  theme?: Theme;
};

const Text = styled.span<TextProps>`
  color: var(--text-inverse);
  background: var(--status-warning);
  font-family: var(--font-primary);
  font-size: 1.4rem;
  height: 2rem;
  line-height: 2rem;
  border-radius: var(--radius-full);
  padding: 0 0.6rem;
`

export const BetaLabel = ({
  theme,
  style = {},
}: {
  theme: Theme
  style?: React.CSSProperties
}) => {
  return (
    <Text theme={theme} style={style}>
      Beta
    </Text>
  )
}
