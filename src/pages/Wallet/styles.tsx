import { Dialog, DialogContent, StepLabel, Tab, Tabs } from '@mui/material'
import styled from 'styled-components'

export const StyledDialogContent = styled(DialogContent)<{ width?: string; height?: string; justify?: string }>`
  &&& {
    width: ${(props) => props.width || '50rem'};
    height: ${(props) => props.height || '40rem'};
    background: var(--bg-secondary);
    border: 0.1rem solid var(--border-primary);
    box-shadow: var(--shadow-glass);
    border-radius: var(--radius-xl);
    display: flex;
    justify-content: ${(props) => props.justify || 'center'};
    flex-direction: column;
    align-items: center;
  }
`

export const StyledDialog = styled(Dialog)<{ width?: string; height?: string; justify?: string }>`
  &&& {
    width: ${(props) => props.width || '50rem'};
    height: ${(props) => props.height || '40rem'};
    background: var(--bg-secondary);
    border: 0.1rem solid var(--border-primary);
    box-shadow: var(--shadow-glass);
    border-radius: var(--radius-xl);
    display: flex;
    justify-content: ${(props) => props.justify || 'center'};
    flex-direction: column;
    align-items: center;
  }
`

export const StyledTabs = styled(Tabs)`
  width: 90%;

  .MuiTabs-flexContainer {
    justify-content: center;
  }

  & > div > span {
    background: var(--interactive-primary) !important;
  }
`

export const StyledTab = styled(Tab)`
  &&& {
    min-width: auto;
    color: var(--interactive-primary);
    border-color: var(--interactive-primary);
    text-transform: capitalize;
    font-size: var(--font-size-sm);
    font-family: var(--font-primary);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }
`

export const StyledStepLabel = styled(StepLabel)`
  & span {
    font-size: var(--font-size-sm);
    font-family: var(--font-primary);
    color: var(--text-primary);
  }

  & svg {
    width: 2rem;
    height: 2rem;

    text {
      font-size: var(--font-size-sm);
      fill: var(--text-primary);
    }
  }
`
