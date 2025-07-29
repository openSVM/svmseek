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
  border-bottom: 1px solid var(--border-main);
  background: var(--bg-primary);

  @media (max-width: 850px) {
    display: flex;
    height: 10rem;
    background: #222429;
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
  font-size: 1.2rem;
  font-family: Avenir Next Medium;
  display: flex;
  color: #fff;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: ${(props) => props.background || '#383b45'};
  border-radius: ${(props) => props.radius || '1.5rem'};
  display: flex;
  justify-content: ${(props) => props.justify || 'space-evenly'};
  flex-direction: ${(props) => props.direction || 'row'};
  align-items: ${(props) => props.align || 'center'};

  @media (max-width: 540px) {
    padding: ${(props) => (props.needBackground ? '0 2rem 0 2rem' : 'auto')};
    background: ${(props) => (props.needBackground ? 'transparent' : 'auto')};
    font-size: 1.5rem;
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
  font-family: Avenir Next;
  border: 0.1rem solid #3a475c;
  font-size: 1.1rem;
  letter-spacing: 0.01rem;
  color: #f8faff;
  border-radius: 1.5rem;
  background: #222429;
  outline: none;
  padding: ${(props) => props.padding || '1rem 7rem 1rem 2rem'};
  position: relative;
  line-height: 3rem;
  overflow: hidden;

  &::placeholder {
    font-size: 1.4rem;
  }

  @media (max-width: 540px) {
    font-size: 1.4rem;
    line-height: 3rem;
    height: 6rem;
  }
`;

export const ContainerForIcon = styled.div`
  cursor: pointer;
  width: 4rem;
  height: 3.5rem;
  border-radius: 1.5rem;
  border: 0.2rem solid #3a475c;
  display: flex;
  justify-content: center;
  align-items: center;

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
  background: #222429;
  border: 0.1rem solid #3a475c;
  box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);
  border-radius: 2rem;
  display: flex;
  justify-content: ${(props) => props.justify || 'center'};
  flex-direction: column;
  align-items: center;
  transition: 0.3s all ease-out;
  @media (max-width: 540px) {
    background: #17181a;
    border: none;
    box-shadow: none;
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
  color: #fff;
  font-family: Avenir Next Medium;
  border: 0.1rem solid #3a475c;
  box-sizing: border-box;
  font-size: 1.5rem;
  border-radius: 1.5rem;
  background: #222429;
  outline: none;
  padding-left: 2rem;
  padding-right: 10rem;

  // fix for autocomplete
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0px 0px 0 50px #222429 inset !important;
    -webkit-text-fill-color: #fff;
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
  font-family: Avenir Next Medium;
  font-style: normal;
  font-weight: 500;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: -0.457692px;
  color: ${(props) => props.color || '#f79894'};
  border: none;
  background-color: #222429;
  backgroung: #222429;
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
  font-family: ${(props) => props.fontFamily || 'Avenir Next Medium'};
  font-style: normal;
  font-weight: normal;
  font-size: ${(props) => props.fontSize || '1.4rem'};
  text-align: center;
  color: ${(props) => props.color || '#ecf0f3'};
  text-align: ${(props) => props.textAlign || 'center'};
  margin: ${(props) => props.margin || '0'};

  @media (max-width: 540px) {
    font-size: ${(props) => props.maxFont || '1.6rem'};
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
  background: ${(props) => props.background || '#383b45'};
  border-radius: ${(props) => props.radius || '1rem'};
  transition: 0.2s;
  outline: none;
  opacity: ${(props) => props.opacity || '1'};
  text-decoration: none;
  &: hover {
    box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);
  }
`;

export type BoldTitleProps = {
  fontSize?: string;
  color?: string;
};

export const BoldTitle = styled.div<BoldTitleProps>`
  font-family: Avenir Next Demi;
  font-size: ${(props) => props.fontSize || '1.6rem'};
  letter-spacing: -0.523077px;
  color: ${(props) => props.color || '#f8faff'};
`;

export const Legend = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  height: 0.1rem;
  background: #383b45;
`;

export type StyledLabelProps = {
  fontSize?: string;
};

export const StyledLabel = styled.label<StyledLabelProps>`
  font-family: Avenir Next;
  font-size: ${(props) => props.fontSize || '1.2rem'};
  color: #93a0b2;
  cursor: pointer;
  @media (max-width: 540px) {
    font-size: 1.6rem;
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
  background: #383b45;
  border: 1px solid #3a475c;
  border-radius: 1.7rem;
  outline: none;
  width: 100%;
  height: 3.5rem;
  color: #fff;
  padding: 0 2rem;

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
  background: #222429;
  border: 0.1rem solid #3a475c;
  border-radius: 1rem;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  padding: 0 1.6rem;
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
