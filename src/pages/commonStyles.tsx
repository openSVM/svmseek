import React from 'react';
import styled from 'styled-components';
import { BtnCustom } from '../components/BtnCustom';
import { Grid, Checkbox, Radio } from '@mui/material';

export type RowProps = {
  wrap?: string;
  justify?: string;
  direction?: string;
  align?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  mediaDirection?: string;
  mediaJustify?: string;
  mediaMargin?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export const Row = styled(
  ({
    wrap,
    justify,
    direction,
    align,
    width,
    height,
    margin,
    padding,
    children,
    style,
    ...props
  }: RowProps) => <div style={style} {...props}>{children}</div>,
)<RowProps>`
  display: flex;
  flex-wrap: ${(props) => props.wrap || 'nowrap'};
  justify-content: ${(props) => props.justify || 'center'};
  flex-direction: ${(props) => props.direction || 'row'};
  align-items: ${(props) => props.align || 'center'};
  width: ${(props) => props.width || 'auto'};
  height: ${(props) => props.height || 'auto'};
  margin: ${(props) => props.margin || '0'};
  padding: ${(props) => props.padding || '0'};
`;

export const RowContainer = styled((props: RowProps) => <Row {...props} />)<RowProps>`
  width: ${(props) => props.width || '100%'};
`;

export type GridContainerProps = {
  wallet?: any;
  theme?: any;
};

export const GridContainer = styled(({ wallet, theme, ...rest }: GridContainerProps) => (
  <Grid {...rest} />
))<GridContainerProps>`
  position: relative;
  display: flex;
  flex: auto;
  align-items: center;
  width: calc(100%);
  height: 6rem;
  position: relative;
  padding: 0rem 3rem;
  margin: 0rem;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-primary);

  @media (max-width: 850px) {
    display: flex;
    height: 10rem;
    background: var(--bg-secondary);
  }
`;

export type ColorTextProps = {
  width?: string;
  height?: string;
  margin?: string;
  background?: string;
  radius?: string;
  justify?: string;
  direction?: string;
  align?: string;
  needBackground?: boolean;
};

export const ColorText = styled.div<ColorTextProps>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '4.5rem'};
  margin: ${(props) => props.margin || '0'};
  font-size: var(--font-size-md);
  font-family: var(--font-primary);
  display: flex;
  color: var(--text-inverse);
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background || 'var(--bg-secondary)'};
  border-radius: ${(props) => props.radius || 'var(--radius-lg)'};
  display: flex;
  justify-content: ${(props) => props.justify || 'space-evenly'};
  flex-direction: ${(props) => props.direction || 'row'};
  align-items: ${(props) => props.align || 'center'};

  @media (max-width: 540px) {
    padding: ${(props) => (props.needBackground ? '0 2rem 0 2rem' : 'auto')};
    background: ${(props) => (props.needBackground ? 'transparent' : 'auto')};
    font-size: var(--font-size-lg);
  }
`;

export type TextareaProps = {
  width?: string;
  height?: string;
  padding?: string;
  type?: string;
  value?: any;
  onChange?: (e: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
};

export const Textarea = styled(({ ...props }: TextareaProps) => (
  <textarea {...props} />
))<TextareaProps>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '5rem'};
  font-family: var(--font-primary);
  border: 1px solid var(--border-primary);
  font-size: var(--font-size-sm);
  letter-spacing: 0.01rem;
  color: var(--text-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  outline: none;
  padding: ${(props) => props.padding || '1rem 7rem 1rem 2rem'};
  position: relative;
  line-height: 3rem;
  overflow: hidden;
  transition: border-color var(--animation-duration-fast) var(--animation-easing-default);

  &:focus {
    border-color: var(--border-focus);
  }

  &::placeholder {
    font-size: var(--font-size-md);
    color: var(--text-tertiary);
  }

  @media (max-width: 540px) {
    font-size: var(--font-size-md);
    line-height: 3rem;
    height: 6rem;
  }
`;

export const ContainerForIcon = styled.div`
  cursor: pointer;
  width: 4rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-glass);
  transition: all var(--animation-duration-fast) var(--animation-easing-default);

  &:hover {
    border-color: var(--border-focus);
    background: var(--bg-secondary);
  }

  @media (max-width: 540px) {
    height: 4.5rem;
    width: 4.5rem;
  }
`;

export type ImgProps = {
  width?: string;
  margin?: string;
};

export const Img = styled.div<ImgProps>`
  width: ${(props) => props.width || 'auto'};
  height: ${(props) => props.width || 'auto'};
  margin-bottom: ${(props) => props.margin || '0rem'};
`;

export type CardProps = {
  width?: string;
  height?: string;
  padding?: string;
  justify?: string;
  minHeight?: string;
  minWidth?: string;
};

export const Card = styled.div<CardProps>`
  width: ${(props) => props.width || '50rem'};
  height: ${(props) => props.height || '40rem'};
  padding: ${(props) => props.padding || '0'};
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-glass);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop);
  display: flex;
  justify-content: ${(props) => props.justify || 'center'};
  flex-direction: column;
  align-items: center;
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--border-focus);
  }
  
  @media (max-width: 540px) {
    background: var(--bg-secondary);
    border: none;
    box-shadow: var(--shadow-sm);
    height: ${(props) => props.minHeight || '40rem'};
    width: ${(props) => props.minWidth || '100%'};
  }
`;

export type InputProps = {
  width?: string;
  height?: string;
  type?: string;
  value?: string;
  autoFocus?: boolean;
  onChange?: (e: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  autoComplete?: string;
  disabled?: boolean;
  onKeyDown?: (e: any) => void;
};

export const Input = styled(({ ...props }: InputProps) => (
  <input
    {...props}
    autoComplete="off"
    onFocus={(e) => e.target.removeAttribute('readonly')}
    readOnly
  />
))<InputProps>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '4.5rem'};
  color: var(--text-primary);
  font-family: var(--font-primary);
  border: 0.1rem solid var(--border-primary);
  box-sizing: border-box;
  font-size: var(--font-size-md);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  outline: none;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-xxl);

  // fix for autocomplete
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0px 0px 0 50px var(--bg-secondary) inset !important;
    -webkit-text-fill-color: var(--text-primary);
  }

  @media (max-width: 540px) {
    font-size: 16px;
    height: 6rem;
  }
`;

export const Body = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

export type TextButtonProps = {
  color?: string;
  width?: string;
};

export const TextButton = styled.button<TextButtonProps>`
  font-family: var(--font-primary);
  font-style: normal;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  text-align: center;
  letter-spacing: -0.457692px;
  color: ${(props) => props.color || 'var(--status-error)'};
  border: none;
  background-color: var(--bg-secondary);
  background: var(--bg-secondary);
  width: ${(props) => props.width || '50%'};
  outline: none;
  cursor: pointer;
`;

export type TitleProps = {
  width?: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  textAlign?: string;
  margin?: string;
  maxFont?: string;
  mediaTextAlign?: string;
  children?: React.ReactNode;
};

export const Title = styled(
  ({
    width,
    fontFamily,
    fontSize,
    color,
    textAlign,
    margin,
    maxFont,
    mediaTextAlign,
    children,
    ...props
  }: TitleProps) => <span {...props}>{children}</span>,
)<TitleProps>`
  width: ${(props) => props.width || 'auto'};
  font-family: ${(props) => props.fontFamily || 'var(--font-primary)'};
  font-style: normal;
  font-weight: normal;
  font-size: ${(props) => props.fontSize || 'var(--font-size-md)'};
  text-align: center;
  color: ${(props) => props.color || 'var(--text-primary)'};
  text-align: ${(props) => props.textAlign || 'center'};
  margin: ${(props) => props.margin || '0'};

  @media (max-width: 540px) {
    font-size: ${(props) => props.maxFont || 'var(--font-size-lg)'};
    text-align: ${(props) => props.mediaTextAlign || 'auto'};
  }
`;

export const VioletButton = styled((props) => (
  <BtnCustom
    btnWidth={props.width || '50%'}
    fontSize={'1.4rem'}
    height={'4.5rem'}
    textTransform={'capitalize'}
    backgroundColor={
      props.disabled
        ? 'var(--bg-secondary)'
        : props.background || 'var(--interactive-primary)'
    }
    borderColor={
      props.disabled
        ? 'var(--bg-secondary)'
        : props.background || 'var(--interactive-primary)'
    }
    btnColor={props.color || 'var(--text-inverse)'}
    borderRadius={'1rem'}
    border={props.border || 'none'}
    hoverBackground={props.hoverBackground || 'none'}
    {...props}
  />
))`
  outline: none;

  @media (max-width: 540px) {
    height: 6rem;
  }
`;

export const RedButton = styled((props) => (
  <BtnCustom
    btnWidth={props.width || '50%'}
    fontSize={'1.4rem'}
    height={'4.5rem'}
    textTransform={'capitalize'}
    backgroundColor={props.background || 'transparent'}
    borderColor={props.background || 'transparent'}
    btnColor={props.color || 'var(--error-main)'}
    borderRadius={'1rem'}
    border={props.border || 'none'}
    {...props}
  />
))`
  outline: none;

  @media (max-width: 540px) {
    height: 6rem;
  }
`;

export const RedFilledButton = styled((props) => (
  <BtnCustom
    btnWidth={props.width || '50%'}
    fontSize={'1.4rem'}
    height={'4.5rem'}
    textTransform={'capitalize'}
    backgroundColor={
      props.disabled
        ? 'var(--bg-secondary)'
        : props.background || 'var(--error-main)'
    }
    borderColor={
      props.disabled
        ? 'var(--bg-secondary)'
        : props.background || 'var(--error-main)'
    }
    btnColor={props.color || 'var(--text-inverse)'}
    borderRadius={'1rem'}
    border={props.border || 'none'}
    {...props}
  />
))`
  outline: none;

  @media (max-width: 540px) {
    height: 6rem;
  }
`;

export const WhiteButton = styled((props) => (
  <BtnCustom
    btnWidth={props.width || 'calc(50% - .5rem)'}
    fontSize={'1.4rem'}
    height={'4.5rem'}
    textTransform={'capitalize'}
    backgroundColor={props.background || 'transparent'}
    borderColor={props.background || 'var(--text-inverse)'}
    btnColor={props.color || 'var(--text-inverse)'}
    borderRadius={'1rem'}
    border={props.border || 'none'}
    {...props}
  />
))`
  outline: none;

  @media (max-width: 540px) {
    height: 6rem;
  }
`;

export type CardButtonProps = {
  width?: string;
  height?: string;
  margin?: string;
  background?: string;
  radius?: string;
  opacity?: string;
};

export const CardButton = styled.div<CardButtonProps>`
  width: ${(props) => props.width || '20rem'};
  height: ${(props) => props.height || '20rem'};
  margin: ${(props) => props.margin || '0'};
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background || 'var(--bg-tertiary)'};
  border-radius: ${(props) => props.radius || 'var(--radius-lg)'};
  transition: var(--animation-duration-fast);
  outline: none;
  opacity: ${(props) => props.opacity || '1'};
  text-decoration: none;
  &: hover {
    box-shadow: var(--shadow-md);
  }
`;

export type BoldTitleProps = {
  fontSize?: string;
  color?: string;
};

export const BoldTitle = styled.div<BoldTitleProps>`
  font-family: var(--font-display);
  font-size: ${(props) => props.fontSize || 'var(--font-size-lg)'};
  letter-spacing: -0.523077px;
  color: ${(props) => props.color || 'var(--text-primary)'};
`;

export const Legend = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  height: 0.1rem;
  background: var(--bg-tertiary);
`;

export type StyledLabelProps = {
  fontSize?: string;
};

export const StyledLabel = styled.label<StyledLabelProps>`
  font-family: var(--font-primary);
  font-size: ${(props) => props.fontSize || 'var(--font-size-sm)'};
  color: var(--text-tertiary);
  cursor: pointer;
  @media (max-width: 540px) {
    font-size: var(--font-size-lg);
  }
`;

export const StyledCheckbox = styled(Checkbox)`
  &&& {
    color: ${(props) =>
      props.disabled
        ? 'var(--text-secondary)'
        : props.color || 'var(--interactive-primary)'};
    &:hover {
      background-color: rgba(54, 108, 229, 0.1);
    }
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

export const StyledRadio = styled(Radio)`
  &&& {
    color: ${(props) => props.color || 'var(--interactive-primary)'};
    &:hover {
      background-color: rgba(54, 108, 229, 0.1);
    }
  }

  & svg {
    width: 2rem;
    height: 2rem;
  }
`;

export const SearchInput = styled.input`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  outline: none;
  width: 100%;
  height: 3.5rem;
  color: var(--text-primary);
  padding: 0 var(--spacing-lg);

  @media (max-width: 540px) {
    height: 4.5rem;
  }
`;

export type ListCardProps = {
  width?: string;
  height?: string;
};

export const ListCard = styled.div<ListCardProps>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '20rem'};
  background: var(--bg-secondary);
  border: 0.1rem solid var(--border-primary);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  padding: 0 var(--spacing-lg);
`;

export type ExclamationMarkProps = {
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  margin?: string;
};

export const ExclamationMark = styled(({ fontSize, lineHeight, ...props }: ExclamationMarkProps) => (
  <span {...props}>!</span>
))<ExclamationMarkProps>`
  color: ${(props) => props.color || 'var(--error-main)'};
  font-family: Avenir Next Demi;
  font-size: ${(props) => props.fontSize || '5rem'};
  line-height: ${(props) => props.lineHeight || '6rem'};
  margin: ${(props) => props.margin || '0 2rem 0 0'};
`;
