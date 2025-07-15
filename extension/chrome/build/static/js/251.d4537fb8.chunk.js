"use strict";(self.webpackChunksvmseek_wallet=self.webpackChunksvmseek_wallet||[]).push([[251],{4026:(e,t,n)=>{n.d(t,{Ay:()=>k,kV:()=>S,vl:()=>C});var i=n(65043),s=n(70221),r=n(43912),a=n(36587),o=n(75087),l=n(99319),d=n(60196),c=n(26240),h=n(78660),m=n(1917),u=n(88446),x=n(21304),p=n(24716),g=n(41963),f=n(10621),y=n(54825),j=n(37435),b=n(30629),A=n(70579);const w=(0,s.Ay)(y.hE)`
  font-size: 1.4rem;
  font-family: Avenir Next Demi;
`,v=(0,s.Ay)(w)`
  color: ${e=>e.theme.customPalette.green.light};
`,S=new Intl.NumberFormat(void 0,{minimumFractionDigits:6,maximumFractionDigits:6});function k(e){let{open:t,onClose:n,allTokensData:s,balanceInfo:g,refreshTokensData:k}=e,T=(0,r.vT)(),[D]=(0,l.e6)(T.tokenAccountCost,T.tokenAccountCost),P=(0,o.No)();const[E,Y]=(0,h.s)(),q=(0,o.xH)(),[z,I]=(0,i.useState)(q?"popular":"manual"),[F,L]=(0,i.useState)(""),[B,K]=(0,i.useState)(""),[M,U]=(0,i.useState)(""),[O,G]=(0,i.useState)(""),[Z,N]=(0,i.useState)(""),[H,W]=(0,i.useState)([]),R=(0,c.A)();let{amount:J,decimals:V}=g||{amount:0,decimals:8},X=!0;function Q(){let e;if("manual"===z)e={mintAddress:B,tokenName:M,tokenSymbol:O};else{if("erc20"!==z)return void Promise.all(H.map(e=>E(ne(e)))).then(()=>{k(),n()});e={erc20Address:Z}}E(ne(e),{onSuccess:()=>{k(),n()}})}X="erc20"===z?42===Z.length&&Z.startsWith("0x"):"manual"===z?""!==B&&""!==O&&O.length<=8&&""!==M&&M.length<=16:H.length>0,(0,i.useEffect)(()=>{q||I("manual")},[q]);const $="popular"===z?(0,m.yH)((+S.format(D/a.LAMPORTS_PER_SOL)||.002039)*H.length,8):(0,m.yH)(+S.format(D/a.LAMPORTS_PER_SOL)||.002039,8),_=J<$,ee=Y||!X||_,te=e=>{"Enter"!==e.key||ee||Q()};async function ne(e){let{mintAddress:t,tokenName:n,tokenSymbol:i,erc20Address:s}=e;if(s){let e=await(0,p.T0)("POST",`coins/eth/${s}`);t=e.splMint,n=e.name,i=e.ticker,"sol"!==e.blockchain&&(n="Wrapped "+n)}let r=new a.PublicKey(t);P(r,n,i);return(await T.createAssociatedTokenAccount(r))[1]}return(0,A.jsxs)(x.A,{open:t,onClose:n,height:"auto",padding:"2rem 0",onEnter:()=>{W([]),N(""),L(""),K(""),U(""),G(""),I(q?"popular":"manual")},children:[(0,A.jsx)(b.A,{}),!!q&&(0,A.jsx)(y.Yq,{margin:"0 0 2rem 0",children:(0,A.jsxs)(j.sg,{value:z,theme:R,onChange:(e,t)=>I(t),children:[(0,A.jsx)(j.bL,{theme:R,label:"Popular Tokens",value:"popular"}),(0,A.jsx)(j.bL,{theme:R,label:"Manual Input",value:"manual"})]})}),(0,A.jsxs)(y.Yq,{direction:"column",children:[(0,A.jsx)(y.Yq,{margin:"0 0 2rem 0",children:D?(0,A.jsxs)(w,{theme:R,children:["Add a token to your wallet. This will cost"," ",(0,A.jsxs)(v,{theme:R,children:[(0,m.yH)(D/a.LAMPORTS_PER_SOL,6)," SOL"]})," ","per token."]}):(0,A.jsx)(d.A,{})}),"manual"!==z&&q?"popular"===z?(0,A.jsx)(y.Yq,{width:"90%",children:(0,A.jsxs)(y.Yq,{justify:"flex-start",direction:"column",children:[(0,A.jsx)(w,{theme:R,children:"Select tokens you want to add to your wallet"}),(0,A.jsx)(y.Yq,{margin:"2rem 0",children:(0,A.jsx)(f.lP,{type:"text",value:F,onChange:e=>{(`${e.target.value}`.match(/[a-zA-Z1-9]/)||""===e.target.value)&&L(e.target.value)},onSearchClick:()=>{},placeholder:"Search"})}),(0,A.jsx)(y.$_,{children:q.filter(e=>{var t;return!e.deprecated&&(""===F||((null!==(t=e.name)&&void 0!==t?t:(0,m.W_)(new a.PublicKey(e.address))).toLowerCase().includes(F.toLowerCase())||e.symbol.toLowerCase().includes(F.toLowerCase())))}).map(e=>(0,A.jsx)(C,{...e,mintAddress:e.address,existingAccount:([...s.values()]||[]).find(t=>t.mint===e.address),disabled:Y,selectedTokens:H,setSelectedTokens:W},e.address))})]})}):"erc20"===z?(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(f.eX,{placeholder:"ERC20 Contract Address",value:Z,onChange:e=>N(e.target.value.trim()),autoFocus:!0,disabled:Y,onPasteClick:()=>navigator.clipboard.readText().then(e=>K(e))}),Z&&X?(0,A.jsx)(u.A,{href:`https://etherscan.io/token/${Z}`,target:"_blank",rel:"noopener",children:"View on Etherscan"}):null]}):null:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(f.eX,{placeholder:"Token Mint Address",value:B,onChange:e=>K(e.target.value),autoFocus:!0,disabled:Y,onKeyDown:te,onPasteClick:()=>navigator.clipboard.readText().then(e=>K(e))}),(0,A.jsx)(y.Yq,{width:"90%",margin:"2rem 0 0 0",children:(0,A.jsx)(y.pd,{placeholder:"Token Name (e.g. SVMSeek)",value:M,onKeyDown:te,onChange:e=>U(e.target.value),disabled:Y})}),M.length>16&&(0,A.jsx)(y.Yq,{width:"90%",margin:"2rem 0 0 0",children:(0,A.jsx)(y.hE,{color:R.customPalette.red.main,children:"Sorry, token name shouldn't be longer than 16 symbols"})}),(0,A.jsx)(y.Yq,{width:"90%",margin:"2rem 0 0 0",children:(0,A.jsx)(y.pd,{placeholder:"Token Symbol (e.g. RIN)",value:O,onKeyDown:te,onChange:e=>G(e.target.value),disabled:Y})}),O.length>8&&(0,A.jsx)(y.Yq,{width:"90%",margin:"2rem 0 0 0",children:(0,A.jsx)(y.hE,{color:R.customPalette.red.main,children:"Sorry, token symbol shouldn't be longer than 8 symbols"})})]}),(0,A.jsxs)(y.Yq,{width:"90%",justify:"space-between",margin:"2rem 0 0 0",children:[(0,A.jsxs)(w,{theme:R,children:["Your SOL Balance:"," ",(0,A.jsxs)(w,{theme:R,style:{color:_?R.customPalette.red.main:R.customPalette.green.light},children:[(0,m.$j)((0,m.yH)(J,V))," SOL"]})]}),(0,A.jsxs)(w,{theme:R,children:["Cost: ",(0,A.jsxs)(v,{theme:R,children:[$," SOL"]})]})]}),(0,A.jsxs)(y.Yq,{width:"90%",justify:"space-between",margin:"2rem 0 0 0",children:[(0,A.jsx)(y._1,{width:"calc(50% - .5rem)",theme:R,onClick:n,children:"Cancel"}),(0,A.jsx)(y.IA,{theme:R,width:"calc(50% - .5rem)",disabled:ee,onClick:()=>Q(),children:"Add"})]})]})]})}function C(e){let{name:t,logoUri:n,symbol:i,mintAddress:s,disabled:r,existingAccount:o,selectedTokens:l,setSelectedTokens:d}=e;const h=!!o,u=(0,c.A)(),x=l.findIndex(e=>e.mintAddress===s),p=-1!==x,f=r||h,j=new a.PublicKey(s);return(0,A.jsx)(A.Fragment,{children:(0,A.jsxs)(y.Yq,{justify:"space-between",style:{borderBottom:u.customPalette.border.new,cursor:"pointer",minHeight:"4.5rem"},onClick:()=>{f||d(p?[...l.slice(0,x),...l.slice(x+1)]:[...l,{tokenName:t,tokenSymbol:i,mintAddress:s}])},children:[(0,A.jsxs)(y.fI,{children:[(0,A.jsx)(g.A,{tokenLogoUri:n,tokenName:t,size:"2rem"}),(0,A.jsxs)(w,{theme:u,style:{marginLeft:"1rem"},children:[null!==t&&void 0!==t?t:(0,m.W_)(j),i?` (${i})`:null]})]}),(0,A.jsx)(y.ph,{theme:u,checked:p||f,disabled:f})]},`${t}${i}${s}`)})}},37435:(e,t,n)=>{n.d(t,{bL:()=>c,gy:()=>h,sg:()=>d});var i=n(35316),s=n(90035),r=n(83625),a=n(24056),o=n(12299),l=n(70221);(0,l.Ay)(i.A)`
  &&& {
    width: ${e=>e.width||"50rem"};
    height: ${e=>e.height||"40rem"};
    background: #222429;
    border: 0.1rem solid #3a475c;
    box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);
    border-radius: 2rem;
    display: flex;
    justify-content: ${e=>e.justify||"center"};
    flex-direction: column;
    align-items: center;
  }
`,(0,l.Ay)(s.A)`
  &&& {
    width: ${e=>e.width||"50rem"};
    height: ${e=>e.height||"40rem"};
    background: #222429;
    border: 0.1rem solid #3a475c;
    box-shadow: 0px 0px 16px rgba(125, 125, 131, 0.1);
    border-radius: 2rem;
    display: flex;
    justify-content: ${e=>e.justify||"center"};
    flex-direction: column;
    align-items: center;
  }
`;const d=(0,l.Ay)(r.A)`
  width: 90%;

  .MuiTabs-flexContainer {
    justify-content: center;
  }
  
  & > div > span {
    background: ${e=>e.theme.customPalette.blue.serum} !important;
  }
`,c=(0,l.Ay)(a.A)`
  &&& {
    min-width: auto;
    color: ${e=>e.theme.customPalette.blue.serum};
    border-color: ${e=>e.theme.customPalette.blue.serum};
    text-transform: capitalize;
    font-size: 1.4rem;
    font-family: Avenir Next Demi;
    white-space: nowrap;
  }
`,h=(0,l.Ay)(o.A)`
  & span {
    font-size: 1.4rem;
  }

  & svg {
    width: 2rem;
    height: 2rem;

    text {
      font-size: 1.4rem;
    }
  }
`},57400:(e,t,n)=>{n.d(t,{A:()=>x});n(65043);var i=n(70221),s=n(54825),r=n(70579);i.Ay.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 0.2rem solid #383b45;
  width: 90%;
  height: 4rem;
`;const a=i.Ay.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
`,o=i.Ay.div`
  position: absolute;
  width: 0;
  height: 100%;
  border-bottom: 2px solid #4b81bd;
  z-index: 1;
  transition: width 1s;
`,l=i.Ay.div`
  position: absolute;
  width: 100%;
  height: 50%;
  border-bottom: 0.1rem solid transparent;
  border-image: ${e=>1===e.currentStep?"linear-gradient(90deg,rgb(115, 128, 235),rgb(147, 160, 178) 36%,rgb(147, 160, 178))":2===e.currentStep?"linear-gradient(90deg, rgb(64, 110, 220), rgb(115, 128, 235) 51%, rgb(147, 160, 178) 90%)":"linear-gradient(90deg, #651CE4, #651CE4 51%, #651CE4 90%)"};
  border-image-slice: 1;
  z-index: -1;
`,d=i.Ay.div`
  width: 3.5rem;
  height: 3.5rem;
  background: ${e=>e.isCompleted?"#406EDC":"#17181a"};
  color: #fff;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  display: flex;
  border: ${e=>e.isSelected||e.isCompleted?"0.1rem solid #406EDC":"0.1rem solid #93A0B2"};
  border-radius: 50%;
  transition: background 1s;
`,c=i.Ay.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 40rem;
  height: 0.1rem;
  background: ${e=>e.isCompleted?"#651CE4":"none"};
`,h=i.Ay.div`
  position: relative;
`,m=(0,i.Ay)(s.hE)`
  position: absolute;
  left: 50%;
  top: calc(100% + 1rem);
  transform: translateX(-50%);
  white-space: nowrap;
`,u=(0,i.Ay)(s.Yq)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  padding: 0 0 7rem 0;
  @media (max-width: 540px) {
    margin-top: ${e=>3===e.currentStep?"45rem":"none"};
  }
  ${e=>e.style}
`,x=e=>{let{currentStep:t,firstStepText:n="Create Password",secondStepText:i="Confirm Seed Phrase",thirdStepText:s="Add Tokens",style:x={}}=e;return(0,r.jsx)(u,{currentStep:t,style:x,children:(0,r.jsxs)(a,{children:[(0,r.jsx)(l,{currentStep:t,children:(0,r.jsx)(o,{})}),(0,r.jsxs)(c,{isCompleted:3===t,children:[(0,r.jsxs)(h,{children:[" ",(0,r.jsx)(d,{isCompleted:t>1,isSelected:1===t,id:"1",children:"1"}),(0,r.jsx)(m,{children:n})]}),(0,r.jsxs)(h,{children:[(0,r.jsx)(d,{isCompleted:t>2,isSelected:2===t,id:"2",children:"2"}),(0,r.jsx)(m,{children:i})]}),(0,r.jsxs)(h,{children:[(0,r.jsx)(d,{isCompleted:t>3,isSelected:3===t,id:"3",children:"3"}),(0,r.jsx)(m,{children:s})]})]})]})})}},63251:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Qe});var i=n(65043),s=n(91688),r=n(70221),a=n(26240),o=n(9048),l=n.n(o),d=n(61916),c=n(43912),h=n(54825),m=n(1917),u=n(61102),x=n(70579);const p=e=>{let{allTokensData:t,tokensData:n}=e;const i=[...t.values()].reduce((e,t)=>{const i=(0,m.a_)(t.symbol);let s=n.get(`${t.symbol}`)||0;return i&&(s=1),e+t.amount*s},0);return(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)("span",{children:["$",(0,m.$j)((0,m.yH)(i,2))]},"total-balance")})};var g=n(46987),f=n(36587);const y=(0,r.Ay)(h.hE)`
  display: none;

  @media (max-width: 540px) {
    display: inline;
  }
`,j=(0,r.Ay)(h.hE)`
  display: inline;
  white-space: nowrap;
  @media (max-width: 540px) {
    display: none;
  }
`,b=(0,r.Ay)(h.Yq)`
  width: 100%;
  height: auto;
  padding: 5rem 4rem;

  @media (max-width: 540px) {
    height: 40%;
    flex-direction: column;
    padding: 0 0 3rem 0;
  }
`,A=(0,r.Ay)(h.fI)`
  width: 40%;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  @media (max-width: 540px) {
    width: 100%;
    padding: 5rem 3rem;
  }
`,w=(0,r.Ay)(h.Yq)`
  @media (max-width: 540px) {
    border-bottom: 0.1rem solid #3a475c;
  }
`,v=(0,r.Ay)(e=>{let{showOnMobile:t,...n}=e;return(0,x.jsx)(h.fI,{...n})})`
  display: ${e=>e.showOnMobile?"none":"flex"};
  height: 100%;

  @media (max-width: 540px) {
    display: ${e=>e.showOnMobile?"flex":"none"};
    height: 50%;
    padding-right: 3rem;
  }
`,S=(0,r.Ay)(h.fI)`
  width: 60%;
  height: 100%;
  justify-content: flex-end;
  @media (max-width: 540px) {
    width: 100%;
    margin-top: 3rem;
    padding: 0 3rem;
  }
`,k=(0,r.Ay)(e=>{let{needLeftMargin:t,...n}=e;return(0,x.jsx)(d.A,{...n})})`
  display: flex;
  width: 26rem;
  height: 100%;
  margin: ${e=>e.margin||"0 4rem 0 0"};
  padding: 1rem 1.5rem;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  background: ${e=>e.background||"linear-gradient(135deg, rgba(19, 49, 173, 0.8) 0%, rgba(59, 141, 23, 0.8) 100%) !important"};
  border-radius: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 540px) {
    margin: 0;
    width: 48%;
    height: 8rem;
    border-radius: 2rem;
    margin-left: ${e=>e.needLeftMargin?"4%":0};
  }
`,C=(0,r.Ay)(h.hE)`
  @media (max-width: 540px) {
    font-size: 1.3rem;
  }
`,T=e=>{let{theme:t,showOnMobile:n=!1}=e;return(0,x.jsxs)(v,{showOnMobile:n,children:[(0,x.jsxs)(h.fI,{height:"100%",direction:"column",justify:"space-around",align:"flex-start",children:[(0,x.jsx)(C,{fontFamily:"Avenir Next",fontSize:"1.4rem",color:t.customPalette.green.main,style:{whiteSpace:"nowrap"},children:"SOL is the fuel for transactions on Solana."}),(0,x.jsx)(C,{fontFamily:"Avenir Next",fontSize:"1.4rem",color:t.customPalette.green.main,style:{whiteSpace:"nowrap"},children:"You must have some SOL in your wallet for"}),(0,x.jsx)(C,{fontFamily:"Avenir Next",fontSize:"1.4rem",color:t.customPalette.green.main,style:{whiteSpace:"nowrap"},children:"DEX trading or other transactions."})]}),(0,x.jsx)(h.B3,{color:t.customPalette.green.main,theme:t,margin:"0 0 0 2rem",fontSize:"7rem"})]})},D=e=>{let{allTokensData:t,tokensData:n}=e;const i=(0,a.A)(),s=(0,c.vT)(),{enqueueSnackbar:r}=(0,g.dh)(),o=(0,c.g5)(s.publicKey);let{amount:d,decimals:v}=o||{amount:0,decimals:8,mint:null,tokenName:"Loading...",tokenSymbol:"--"};const C=s.publicKey.toBase58();return(0,x.jsxs)(b,{children:[(0,x.jsxs)(w,{justify:"flex-start",children:[(0,x.jsxs)(A,{children:[(0,x.jsx)(u.Ay,{}),(0,x.jsxs)(j,{color:i.customPalette.grey.light,children:[C," ",(0,x.jsx)(h.hE,{style:{marginLeft:"2rem",color:"#651CE4",cursor:"pointer"},onClick:()=>{l()(C),r("Copied!",{variant:"success"})},children:"Copy"})]}),(0,x.jsxs)(y,{style:{whiteSpace:"nowrap"},color:i.customPalette.grey.light,children:[(0,m.W_)(new f.PublicKey(C)),(0,x.jsx)(h.hE,{style:{marginLeft:"2rem",color:"#651CE4",cursor:"pointer"},onClick:()=>{l()(C),r("Copied!",{variant:"success"})},children:"Copy"})]})]}),(0,x.jsx)(T,{showOnMobile:!0,theme:i})]}),(0,x.jsxs)(S,{children:[(0,x.jsxs)(k,{margin:"0 2rem 0 0",background:"linear-gradient(135deg, #1331AD 0%, #95363F 100%)",children:[(0,x.jsx)(h.hE,{fontSize:"1.4rem",fontFamily:"Avenir Next Demi",color:i.customPalette.grey.light,maxFont:"2rem",children:"Total Balance"}),(0,x.jsx)(h.hE,{maxFont:"2.1rem",fontSize:"2.4rem",fontFamily:"Avenir Next Demi",children:(0,x.jsx)(p,{allTokensData:t,tokensData:n},"navbarfalse")})]}),(0,x.jsxs)(k,{needLeftMargin:!0,children:[(0,x.jsx)(h.hE,{fontSize:"1.4rem",fontFamily:"Avenir Next Demi",color:i.customPalette.grey.light,maxFont:"2rem",children:"SOL Balance"}),(0,x.jsxs)(h.hE,{maxFont:"2.1rem",fontSize:"2.4rem",fontFamily:"Avenir Next Demi",children:[(0,m.$j)((0,m.yH)(d/Math.pow(10,v),8))," ","SOL"]})]}),(0,x.jsx)(T,{theme:i})]})]})},P=i.memo(D,(e,t)=>JSON.stringify([...e.allTokensData.values()])===JSON.stringify([...t.allTokensData.values()])&&JSON.stringify([...e.tokensData.values()])===JSON.stringify([...t.tokensData.values()]));var E=n(55689);const Y=(0,r.Ay)(E.K3)`
  width: calc(15% - 1rem);
  flex-direction: column;
  @media (max-width: 540px) {
    display: ${e=>e.isActive?"block":"none"};
  }
`,q=(0,r.Ay)(h.Yq)`
  height: 5rem;
  @media (max-width: 540px) {
    display: none;
  }
`,z=(0,r.Ay)(h.hE)`
  @media (max-width: 540px) {
    font-size: 2rem;
    white-space: nowrap;
  }
`,I=e=>{let{isActive:t}=e;const n=(0,a.A)();return(0,x.jsxs)(Y,{isActive:t,theme:n,children:[(0,x.jsx)(q,{children:(0,x.jsx)(E.Ri,{theme:n,justify:"flex-start",style:{width:"100%",padding:"1.4rem 0 1.4rem 2.4rem"},children:(0,x.jsx)(E.Cg,{theme:n,children:"Activity"})})}),(0,x.jsx)(h.Yq,{height:"100%",children:(0,x.jsx)(z,{children:"Coming Soon"})})]})};var F=n(21304),L=n(78660),B=n(24716),K=n(63574),M=n(98533),U=n(56991),O=n(43956),G=n(99319),Z=n(37360),N=n(60545),H=n(10621),W=n(78182),R=n(30629),J=n(57400),V=n(37435);const X=new f.PublicKey("BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW"),Q=new f.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),$=new f.PublicKey("BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4"),_=new f.PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),ee=(e,t,n)=>null!==e&&void 0!==e&&e.equals(X)?[(0,x.jsx)(V.bL,{theme:n,label:"SPL WUSDC",value:"spl"},"spl"),(0,x.jsx)(V.bL,{theme:n,label:"SPL USDC",value:"wusdcToSplUsdc"},"wusdcToSplUsdc")]:null!==e&&void 0!==e&&e.equals($)?[(0,x.jsx)(V.bL,{theme:n,label:"SPL WUSDT",value:"spl"},"spl"),(0,x.jsx)(V.bL,{theme:n,label:"SPL USDT",value:"wusdtToSplUsdt"},"wusdtToSplUsdt")]:[(0,x.jsx)(V.bL,{theme:n,label:`SPL ${t.ticker}`,value:"spl"},"spl")];function te(e){let{open:t,onClose:n,publicKey:s,balanceInfo:r,refreshTokensData:o}=e;const{mint:l,symbol:d}=r,c=new f.PublicKey(l),m=(0,O.tC)(),[u,p]=(0,i.useState)("spl"),[g]=(0,B.PI)(K.FG&&r.mint&&m?`coins/sol/${c.toBase58()}`:null),y=(0,U.wq)(),j=(0,a.A)(),b="wUSDT"===d||"wUSDC"===d?d.replace("w","Wrapped "):d;return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(F.A,{open:t,theme:j,onClose:n,onEnter:()=>{p("spl")},height:"auto",padding:"2rem 0",children:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(R.A,{}),(0,x.jsx)(h.Yq,{children:(0,x.jsxs)(h.hE,{fontSize:"1.6rem",children:["Send ",b?` ${b} to`:null]})}),null!==c&&void 0!==c&&c.equals(X)||null!==c&&void 0!==c&&c.equals($)?(0,x.jsx)(V.sg,{value:u,theme:j,variant:"fullWidth",onChange:(e,t)=>p(t),textColor:"primary",indicatorColor:"primary",children:ee(c,g,j)}):null,"spl"===u?(0,x.jsx)(ne,{onClose:n,publicKey:s,balanceInfo:r,refreshTokensData:o}):"wusdcToSplUsdc"===u?(0,x.jsx)(ie,{ethAccount:"",tab:u,onClose:n,refreshTokensData:o,publicKey:s,balanceInfo:r,swapCoinInfo:g,wusdcToSplUsdc:!0},u):"wusdtToSplUsdt"===u?(0,x.jsx)(ie,{onClose:n,ethAccount:"",tab:u,publicKey:s,balanceInfo:r,swapCoinInfo:g,refreshTokensData:o,wusdtToSplUsdt:!0},u):(0,x.jsx)(ie,{tab:u,onClose:n,publicKey:s,balanceInfo:r,swapCoinInfo:g,ethAccount:y,refreshTokensData:o},u)]})}),y&&("eth"===(null===g||void 0===g?void 0:g.blockchain)||null!==g&&void 0!==g&&g.erc20Contract)?(0,x.jsx)(ae,{ethAccount:y,publicKey:s}):null]})}function ne(e){let{onClose:t,publicKey:n,balanceInfo:s,refreshTokensData:r}=e;const{decimals:o,mint:l}=s,d=new f.PublicKey(l),m=!d||d.equals(Z.SO)?"Enter Solana Address":"Enter SPL token or Solana address",u=(0,c.vT)(),[p,g]=(0,L.s)(),[y,j]=(0,i.useState)(m),[b,A]=(0,i.useState)(void 0),[w,v]=(0,i.useState)(!1),[S,k]=(0,i.useState)(void 0),{fields:C,destinationAddress:T,transferAmountString:D,validAmount:P}=re(s,y,b,"spl",!1),E=d.toString(),Y=(0,a.A)();(0,i.useEffect)(()=>{(async()=>{if(!T)return j(m),A(void 0),void k(void 0);try{const e=await u.connection.getAccountInfo(new f.PublicKey(T));if(k(!1),e.owner.equals(Z.x5)){(0,N.UZ)(e.data).mint.toBase58()===E?(A(!0),j("Address is a valid SPL token address")):(A(!1),j("Destination address mint does not match"))}else A(!0),j("Destination is a Solana address")}catch(e){console.log(`Received error validating address ${e}`),j(m),k(!0),A(void 0)}})()},[T,u,E]);const q=S?!w||g||!P:g||!P;return(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(h.Yq,{width:"90%",direction:"column",children:[C,S&&(0,x.jsxs)(h.Yq,{margin:"0 0 2rem 0",style:{alignItems:"center",display:"flex",textAlign:"left"},children:[(0,x.jsx)(h.Gw,{theme:Y,htmlFor:"overrideDestinationCheck",children:"This address has no funds. Are you sure it's correct?"}),(0,x.jsx)(h.ph,{theme:Y,id:"overrideDestinationCheck",checked:w,onChange:()=>v(!w)})]}),(0,x.jsxs)(h.Yq,{justify:"space-between",children:[(0,x.jsx)(h._1,{theme:Y,onClick:t,width:"calc(50% - .5rem)",children:"Cancel"}),(0,x.jsx)(h.IA,{theme:Y,type:"submit",color:"primary",width:"calc(50% - .5rem)",disabled:!!q,onClick:async function(){return"function"===typeof p&&p(async function(){let e=Math.round(parseFloat(D)*10**o);if(!e||e<=0)throw new Error("Invalid amount");return u.transferToken(n,new f.PublicKey(T),e,d,o,null,w)}(),{onSuccess:()=>{r(),t()},onError:()=>{}})},children:"Send"})]})]})})}function ie(e){let{tab:t,onClose:n,publicKey:s,balanceInfo:r,swapCoinInfo:o,ethAccount:l,refreshTokensData:d,wusdcToSplUsdc:m=!1,wusdtToSplUsdt:u=!1}=e;const p=(0,c.vT)(),[g,y]=(0,L.s)(),[j,b]=(0,i.useState)(null),{fields:A,destinationAddress:w,transferAmountString:v,setDestinationAddress:S,validAmount:k}=re(r,"",!0,t,null===o||void 0===o?void 0:o.erc20Contract),C=(0,a.A)(),{name:T,decimals:D,mint:P}=r,E=new f.PublicKey(P),Y=m||u?"sol":"sol"===(null===o||void 0===o?void 0:o.blockchain)?"eth":null===o||void 0===o?void 0:o.blockchain,q="eth"===Y;let z=(0,c.Us)(m?Q:null),I=(0,c.Us)(u?_:null);if((0,i.useEffect)(()=>{m&&z&&S(z)},[S,m,z,u,I]),j)return(0,x.jsx)(se,{publicKey:s,signature:j,refreshTokensData:d,blockchain:Y,onClose:n},j);let F=(0,x.jsx)(h.IA,{type:"submit",color:"primary",theme:C,width:"calc(50% - .5rem)",disabled:!(!y&&k),onClick:async function(){return"function"===typeof g&&g(async function(){let e=Math.round(parseFloat(v)*10**D);if(!e||e<=0)throw new Error("Invalid amount");const t={blockchain:Y,address:w,size:e/10**D};"sol"===Y?t.coin=null===o||void 0===o?void 0:o.splMint:"eth"===Y&&(t.coin=null===o||void 0===o?void 0:o.erc20Contract),null!==E&&void 0!==E&&E.equals(X)?t.wusdcToUsdc=!0:null!==E&&void 0!==E&&E.equals($)&&(t.wusdtToUsdt=!0);const n=await(0,B.T0)("POST","swap_to",t);if("sol"!==n.blockchain)throw new Error("Unexpected blockchain");return p.transferToken(s,new f.PublicKey(n.address),e,E,D,n.memo)}(),{onSuccess:b,onError:e=>{console.log("error",e)}})},children:"Send"});return(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(h.Yq,{width:"90%",direction:"column",margin:"2rem 0 0 0",children:[(0,x.jsxs)(h.hE,{children:["SPL ",T," can be converted to"," ","eth"===Y&&null!==o&&void 0!==o&&o.erc20Contract?"ERC20":"sol"===Y&&null!==o&&void 0!==o&&o.splMint?"SPL":"native"," ",null===o||void 0===o?void 0:o.ticker,q?" via MetaMask":null,"."]}),q&&!l?(0,x.jsx)(U.z5,{}):A,(0,x.jsxs)(h.Yq,{justify:"space-between",margin:!l&&"2rem 0 0 0",children:[(0,x.jsx)(h._1,{theme:C,onClick:n,width:"calc(50% - .5rem)",children:"Cancel"}),F]})]})})}function se(e){let{publicKey:t,signature:n,onClose:s,blockchain:r,refreshTokensData:o}=e;const{enqueueSnackbar:l}=(0,g.dh)(),[d,c]=(0,i.useState)(!1),[m,u]=(0,i.useState)(!1),p=(0,O.w5)(),f=(0,a.A)(),[y]=(0,B.PI)(`swaps_from/sol/${t.toBase58()}`,{refreshInterval:1e3}),[j]=(0,G.e6)(async()=>{const{value:e}=await p.getSignatureStatus(n);return null===e||void 0===e?void 0:e.confirmations},[p.getSignatureStatus,n],{refreshInterval:2e3});(0,i.useEffect)(()=>{d&&!m&&(u(!0),l("Success!",{variant:"success"}),o(),s())},[d,l,o,s,m]);let b=1,A=null;for(let i of y||[]){const{deposit:e,withdrawal:t}=i;var w;if(e.txid===n)null!==(w=t.txid)&&void 0!==w&&w.startsWith("0x")?(b=3,A=t.txid,d||c(!0)):t.txid&&"eth"!==r?(b=3,d||c(!0)):b=2}const v=j&&j>0?2:null===j||3===b?4:b;return(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(h.Yq,{direction:"column",children:[(0,x.jsx)(J.A,{currentStep:v,firstStepText:"Send Request",secondStepText:j?`Wait for Confirmations (${j}/35)`:"Transaction Pending",thirdStepText:"Withdraw Funds",style:{padding:"7rem 0 10rem 0"}}),A||"eth"!==r?null:(0,x.jsx)(M.A,{style:{marginTop:16,marginBottom:0},children:"Please keep this window open. You will need to approve the request on MetaMask to complete the transaction."}),(0,x.jsxs)(h._1,{theme:f,onClick:s,style:{display:"flex",flexDirection:"column"},children:["Close Popup",(0,x.jsx)("span",{style:{fontSize:".9rem"},children:"(the conversion process will not be stopped)"})]})]})})}function re(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"spl",r=!(arguments.length>4&&void 0!==arguments[4])||arguments[4];const[o,l]=(0,i.useState)(""),[d,c]=(0,i.useState)(""),{amount:u,symbol:p}=e,g=parseFloat(d),f=g>0&&g<=u,y=(0,a.A)(),j="wUSDT"===p||"wUSDC"===p?p.replace("w","Wrapped "):p,b="wusdcToSplUsdc"===s||"wusdtToSplUsdt"===s;let A=String((0,m.yH)(u,8));"SOL"===p&&(A=String((0,m.yH)(parseFloat(String(A))-5e-6,8)));return{fields:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(h.Yq,{margin:"2rem 0",children:(0,x.jsx)(H.eX,{placeholder:"Recipient Address",type:"text",style:{fontSize:"1.2rem"},containerStyle:{width:"100%"},onChange:e=>l(e.target.value),value:o,onPasteClick:()=>navigator.clipboard.readText().then(e=>l(e))})}),!n&&(0,x.jsx)(h.Yq,{margin:"0 0 2rem 0",children:(0,x.jsx)(h.hE,{fontSize:"1.4rem",color:y.customPalette.red.main,children:t})}),(0,x.jsx)(h.Yq,{children:(0,x.jsx)(W.A,{blockHeight:"8rem",iconStyle:{margin:"0 2rem 0 3rem"},textStyle:{fontSize:"1.4rem"},text:`Please make sure that you sending funds to the ${b?` Native ${p.replace("w","")}`:j} address in the ${"spl"===s?"SPL":r?"ERC20":"Native"} network.`})}),(0,x.jsx)(h.Yq,{margin:"2rem 0",children:(0,x.jsx)(H.zC,{placeholder:"Amount",type:"text",containerStyle:{width:"100%"},onChange:e=>c(e.target.value),value:d,onMaxClick:()=>c(A),maxText:`${A} ${p?j:null}`})})]}),destinationAddress:o,transferAmountString:d,setDestinationAddress:l,validAmount:f}}function ae(e){let{ethAccount:t,publicKey:n}=e;const[i]=(0,B.PI)(`swaps_from/sol/${n.toBase58()}`,{refreshInterval:1e4});return i?i.map(e=>(0,x.jsx)(oe,{ethAccount:t,swap:e},e.deposit.txid)):null}function oe(e){let{ethAccount:t,swap:n}=e;const s=(0,L.I)(),{withdrawal:r}=n;return(0,i.useEffect)(()=>{"sent"===r.status&&"eth"===r.blockchain&&r.txid&&!r.txid.startsWith("0x")&&r.txData&&(0,U.g8)(t,r,s)},[r.txid,r.status]),null}var le=n(37834),de=n(76839),ce=n(25078),he=n(81637),me=n(88446),ue=n(48812);function xe(e){var t;let{open:n,onClose:s,publicKey:r,isAssociatedToken:o}=e;const l=(0,c.g5)(r)||{amount:0,decimals:8,mint:null,tokenName:"Loading...",tokenSymbol:"--",owner:null},d=(0,O.tC)(),[u]=(0,G.e6)(async()=>{var e;return K.FG&&d?await(0,B.T0)("POST","swap_to",{blockchain:"sol",coin:null===(e=l.mint)||void 0===e?void 0:e.toBase58(),address:null===r||void 0===r?void 0:r.toBase58()},{ignoreUserErrors:!0}):null},["swapInfo",d,null===(t=l.mint)||void 0===t?void 0:t.toBase58(),null===r||void 0===r?void 0:r.toBase58()]),p=(0,U.wq)(),g=(0,O.jJ)(),{mint:f,tokenSymbol:y,owner:j}=l,[b,A]=(0,i.useState)(0),w=(0,a.A)(),v="wUSDT"===(null!==y&&void 0!==y?y:(0,m.W_)(f))||"wUSDC"===(null!==y&&void 0!==y?y:(0,m.W_)(f))?(null!==y&&void 0!==y?y:(0,m.W_)(f)).replace("w","Wrapped "):null!==y&&void 0!==y?y:(0,m.W_)(f),S=j&&r.equals(j)||o,k=S?null===j||void 0===j?void 0:j.toBase58():r.toBase58();let C;return u?(C=`Deposit SPL ${v}`,f||(C="Deposit SOL")):C=`Deposit SPL ${v}`,(0,x.jsxs)(F.A,{open:n,onClose:s,height:"auto",padding:"2rem 0",onEnter:()=>{A(0)},children:[(0,x.jsx)(R.A,{}),(0,x.jsx)(h.Yq,{padding:"1.6rem 0 2.4rem 0",children:(0,x.jsx)(h.hE,{fontSize:"1.6rem",children:C})}),(0,x.jsx)(h.Yq,{direction:"column",padding:"0",children:0===b?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(h.Yq,{width:"90%",children:(0,x.jsx)(H.SJ,{value:k,height:"5rem"})}),(0,x.jsx)(h.Yq,{width:"90%",justify:"flex-start",padding:"1rem 0 0 1.6rem",children:(0,x.jsx)(me.A,{href:`https://explorer.solana.com/account/${k}`+g,target:"_blank",rel:"noopener",style:{color:w.customPalette.blue.serum,fontSize:"1rem",fontFamily:"Avenir Next Demi"},children:"View on Solana Explorer"})}),(0,x.jsx)(h.Yq,{width:"90%",padding:"2rem 0",children:(0,x.jsx)(W.A,{text:S||!1!==o?`This address can be used to receive ${null!==y&&void 0!==y?y:(0,m.W_)(f)}.`:`This address can only be used to receive ${null!==y&&void 0!==y?y:(0,m.W_)(f)}. Do not send other tokens to this address.`,blockHeight:"8rem",iconStyle:{margin:"0 2rem 0 3rem"},textStyle:{fontSize:"1.4rem"}})})]}):(0,x.jsx)(pe,{balanceInfo:l,swapInfo:u,ethAccount:p,onClose:s,publicKey:r})}),0===b&&(0,x.jsx)(h.Yq,{margin:"2rem 0 0 0",children:(0,x.jsx)(h._1,{theme:w,width:"calc(50%)",onClick:s,children:"Close"})})]})}function pe(e){let{balanceInfo:t,swapInfo:n,ethAccount:i,onClose:s,publicKey:r}=e;const o=(0,a.A)(),[l]=(0,G.e6)(()=>(0,U.Lh)(i),"ethBalance",{refreshInterval:2e3}),d=(0,G.e6)((null===n||void 0===n?void 0:n.coin)&&(()=>(0,U.$P)({erc20Address:n.coin.erc20Contract,swapAddress:n.address,ethAccount:i})),"depositEthFee",{refreshInterval:2e3});if(!n)return null;const c=Array.isArray(d[0])?d[0].reduce((e,t)=>e+t):d[0],u="number"===typeof l&&"number"===typeof c&&l<c,{blockchain:p,address:g,memo:f,coin:y}=n,{mint:j,tokenName:b,owner:A,tokenSymbol:w}=t;return"btc"===p&&null===f?(0,x.jsxs)(h.Yq,{direction:"column",width:"90%",children:[(0,x.jsxs)(h.hE,{style:{marginBottom:"2rem"},children:["Native BTC can be converted to SPL ",b," by sending it to the following address:"]}),(0,x.jsx)(H.SJ,{value:g,height:"5rem"}),(0,x.jsx)(h.Yq,{padding:"2rem 0",children:(0,x.jsx)(W.A,{text:A&&null!==r&&void 0!==r&&r.equals(A)?"This address can only be used to receive SOL. Do not send other tokens to this address.":`This address can only be used to receive ${null!==w&&void 0!==w?w:(0,m.W_)(j)}. Do not send SOL to this address.`,blockHeight:"8rem",iconStyle:{margin:"0 2rem 0 3rem"},textStyle:{fontSize:"1.4rem"}})}),(0,x.jsx)(h.Yq,{margin:"2rem 0 0 0",children:(0,x.jsx)(h._1,{theme:o,width:"calc(50%)",onClick:s,children:"Close"})})]}):"eth"===p?(0,x.jsxs)(h.Yq,{width:"90%",direction:"column",children:[(0,x.jsxs)(h.hE,{fontSize:"1.4rem",fontFamily:"Avenir Next Demi",children:[y.erc20Contract?"ERC20":"Native"," ",y.ticker," can be converted to ",j?"SPL":"native"," ",b," via MetaMask."]}),!i&&(0,x.jsx)(h.hE,{fontSize:"1.4rem",fontFamily:"Avenir Next Demi",style:{padding:"1rem 0"},children:"To convert, you must already have SOL in your wallet"}),(0,x.jsx)(h.Yq,{children:(0,x.jsxs)(h.hE,{fontSize:"1.4rem",fontFamily:"Avenir Next Demi",children:["Estimated withdrawal transaction fee: ","  ",(0,x.jsx)(ue.W,{ethFeeData:d,insufficientEthBalance:u})]})}),!i&&(0,x.jsx)(h.Yq,{margin:"2rem 0",children:(0,x.jsx)("img",{src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABACAYAAACjgtGkAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABU/SURBVHgB7TsJkB3Fda97jn/s31MraaXVsdIulxSwdSAEQiAEoiAQIBhhG3OEYMd2UlQZY4iDjVkBIRgSmTIplwOOXZhQEERchgBCNjq4JIMlJHEJIWl17aJjd7W7f//+Y67O65k/Mz3Xl3KV45Rf6Wtm+nj93ut39ZtZgD9AAIj4cM9FzU9MbqTnzZ+RWkXT6cfn3N+zC/4fwvZvTawzCF387gHjK/sH2M/uXzvwotvnCeTb5zY2ZzJkG2EwbVwdgQWdyvCEeunXFUafyB9u+9X8x7bo8HsMDHndePuMaW3Zytc03bpm4x6t69MRC3Tk795fH/szd5wnkLsvbP6CQtnT7uxsisCZHRJ0TpR03ZDfHDOkZ/Il67lzftB7DH6P4Nnly6VZp7xzfr1k3CBT65r+vJnb8IkO+RKzuWdAevtS6VMee/FQkY93BUJWLGt+iQC71H5ibivAqW0SzO+QIa0A6BYZqTDp0UKJPj/n+we3EOKN/D8Hm77R0TG+QVueouwm3OjZpsUATQTe77XAsKpkc+7xVjPkC+7fMLDBbYLvLG2anpJgK3Y2eyJi/oTJTRQWdcnQmKVux9iIJv/SBPiXnqPm61c85kj3dw3dS5bIlyzcv7RNrVyjSmw5JVYTZ6FQAXhtlw69Q1Zgs10eTUZ+vOLVob/kLTb73Rc1/Tmy+hNwNcYdDP7kDGrI2Z0KzBwveZgYMEO3pI9GdPmfR/Lq0+c9ursffgew8bYpLS110i1ZSeOCmIuUyW5f7zCDt3brMFxkENhsF7ANxbSbyXTeitXH8mT5cpBmH2t+nVJ2jqgV7uAAAtuEKCxEwcg0qEoGQKliSc8cHcv+cNHDu7bB/zI8i3TPOKVj8XiqXY8m8UX0D1mPSATDZLD5gAkf9BlgWsdBhlPKFix9YO3wevLNi1umNlrWDmyr8wdwb5MgUYQJDQSWnqZALkUgrE7opKBkyi+XmPSjf6M3r+7u7j4eOf8pePiGM+ou7xj+UoaYN6Zlc1HUjRGoGAzWfazDAddEwpsc0hAOpiU9tGLt4F+Tuy9s+p5CYEUIpw8MEkyIwFkzZeiaQEOTvIHMZHRv2aT/ms3R3YwRE7y9kiAJCKGGaWuxTWZ1rAlaGRfQ2bysbPyVRCDj0BTkkvtK7ifW7zSgrLMoP0lC4Y+EHKrQyjxZonBhsCc0kQQF4faXNAZvoqM6MiLBAhSMIoXFzohErJk5hf1Ng2KAFJCBAQGvZt+xYJYYWrSEItLCdHr92Iey23bQgO0HTUeaInp/meBV6EdNm0SN9GdkpLvJw06ijCci5mwhETsOm+jFLdvhNmTCEuSbyKCCnGQzMdsS5CwBUFTIoWGEufAhjw5gU48B+wZdE/G49NGzRPTiQyelQHYHNIEkTBCvIeQHhxg8v12Hnn4ToiqGu4c5rhXa0TCSeO1wQNcJWFbcbjHoGTDhBVzbE0YMbm9agk90UcqMvU+RhY8AAmv4g8LXON9ShQra7PqPucoamOjwTfK3x/J2GGIWCN8Hl+A/3YDIwhhE4O19Jrz2iQFjFZasfGEhhLXdJ7Oky3SvjJnIexGvm+R8WMyCwjzu4zYjkdyxnX8yRqG0v2IFkyNFrmoz1PIZAZS2ME0juHBRs2AtCv8QnkUYQLwlsQT6EyzABLIz39NylGIavh0cL1ebshNprwrlECZDv9yGYe+Y5XXoyBT3Of7QMPVxTwQ0TQgmeN111ITntmrw6bDltMeYcARR0lJiIGLWx4/u3q1RJW0ewfZCYFCcmrmIo34zaNbV5zJGobU7dPjtPh39B/OZi6Usis5LsHTnyk3k3V4T1mFILVUCA5P9HkmgPxx1ePpOpLd5D+1pHipgDO6NRSwicRGLjLOYccJCJmrEdswW13ygwShGAu5cxTnBzY1yxbWK4xgsMPj37RoK14jfsLjpcUFNjJziGB6QmG0pQFetQvPBg2CiWSQxH75nEBVYFfowCq1+X4c9Ry3UHHGqaDhRjdFx7O5+A158X4Mj+ZjU4HhOCBLGhB0sHlY109jL75w0k1kfxoaipAXCuxSnKSHIlxm8jnWIzXsN3ydEdNkH7m/exAjy2k4TykYMM2HGjudPagmPwIF0LnOU3zoCoeoH2GjB8elMXiTJ77h9+KzggXB8VopMYgmcZPF4QGgMhyfCeLKLiuDCHOmTe148VOKPtkB0YEcZjzTR2BxdPOleJEZ8ruJqzBK4eJYMk/BgyFiQahKLisDp7ZIdvlMSia4XZzpxiMSxSfcEdpLqTOmGiyfWtTLjIdy8MxIoS0KS3C4SR5wC0zI8HY/LUbtBVRlQGpxIQgh5ZqprBFqwKDUuR+DTEXSyJiQLIInpMB/xTtma15Fet2lveYQ2jehOxYdVNTcMoXAa6YszFdf/YV/XeAqXzMZzTpp6FPlpuIjEn8hCCKc2U7jiDAWa60hwDZZApygEqEGjRwaZmZboAn4nvdNXqiy5sfwLdiA7jRA2J4JMfBZNSmyPaeP1ozlTJfvQ5xSTfAoUrL5RydUKiCDgdzzc6rrfnkJ/wqt1hzE7HdNq0JhkNgmA+XK+YsgXP7BucB1/5tpBzqGtt8jU/C5hnv5GFxI3Mq5PAFUmsKhThjPaZaAkikTCFJ7/wmiJwBUXiGEECVGQ2pnjZax1WDAwFsN1koDCv+AQCTVZXdiZfv2tnnLFtmRKjAGkqD9WwrUcVYymZFUCF50mY6lR9s4tDvj66jBPvP/jZO2k5aJuO8iwZgqLuxSYO02KMh2GE9MUGS1j8qgh2wcLG+vre8sfnzs99wkWdC7Hx1Sis4wzGWFcHQrjstMVaGugEPV+AgW4qqyIU33huMBPx6YRv+Vc0BPrKQoHz03obFmcLwvTDaH2KuCxYnVpmFz3yKbBUZs2/t+di1rrFcW8DjOReg9pnCOKAT5sAkaRqS0ETkYbr09RiM+Zfeos5lz9ZeJyjfCuBL27jJry2akyOloKO/HAdzSPvqUMQbpraQ1xL7QdmtVpePs+f7YF8tBbA4XuZc2M2q8oUGtETWVREaRkBu0tFH/o6LCm2ozhVCtyR0hqUOLPF1LVwNhgSaBWwuPPm450nDyZ8lwKDg4y2HPEhH5M8/n5h4UjD4lDxyYT01TdJ/f9BdunN948Xcq3otlcFJhMnPDZhIlVJzI/A3/jMbnirzpdh1kucyd4PAbcdlKtnpGIdpATwBC3SxXUjCyG5NPa8YfC0ZCWY3h+P4DVtB48Px1Bs+JFq+heMctgyq0Prh/YEkcD3HNpVwPVBz/CXLI9jWGuYwLA1HGSrQX1GS4AAuHCDj/Sl4pxoiexwuDAQ259PYvp8aFUdHAfP8Q5GPim1eUgVMx2oILCODhgoYAs+4CJ53s+Fd95S3fct3bwh3EYPXjhLyZ9tWOc8ePprRRjfxS5SDyvZo0ViH2NEh02ZkETkPqGRpaIm19LY24eUivkBYVFMcXP5VgougXHcP81MGrBzkPkvVW/mTL/sS3BrxrkMFGLTqVL6+TqIRjEwOij5/9z+ywVmW0qEbsnoecY1u33YCHCiXi2YeL8pBBSfa6+VOOlxiJqVjbrDCECF45mcy1n+KKN+z0yLZ0bmvTYFjgASQJ5+Z6uBpUUr/IR+AjDzHGtGBk2cRedAwYhIQZdgoijEYEufM41SCFhB9cp44uYiuZX0r1RVjCx5zdu2OV9CmZvmYzkmTdUxeHy4opHoqzp5NYK/9rhnyBJICepxtmKxD0u8TXBRhYWCrNttbFJhoF+VhVK/D7GGRJXbWCSoEl+WHXHa1jFL46ZonyDggiBi7exScGDo+WNJKGZYnqCQrsyLBAqPoxLGzeFGSeJpOD7xCxDAtJYTfc9mZi7JREvyW6kYSHc/mqS4B19cfnP7s/DqVBoasraNEEAmz+ThfCokrlo630zTxLQ+AJ55bZZLagdS2o7MRH4EZ5AOsOgvjGDQqGRzMElGJObUd2ih1xstkCsMDYIrCVJ/l7h/GF8T3xEFLS4loxrN9RnIZXmNMVllT434i8lWQ1tqr5MHOOtOrtt7FKZskn+1DBCEro6oKgmZo0YNXB3uP0GQrJF80MVdeWgJp+3t1D3dWTMDtCcWb9I5BonCegLxYIJr5nw3lFdeWRnvmnBYEW5q2LRPhDGcVwNDVkUCiaMGUvoCdKZBCnZukYc7Akkq5g3kogKAyTn8M5e8Y1U0ybaI4XGRiQMhVKyaO8xTb1za39L1+LHj95+weP9267++cEXiqb0Gp/JNYTFfCRBBOFwfFwoBmrHkbLyj9c+2XPgvMf7/+5ne1s6+430zUVT3sk3gK/JhaKkTO4oIRrufYjTFxTIgl0PdLUGBLLrvq7OtGTMjUfAjo8UtYSrqpNfZGDi1NyG1inZg5V0NpB87i9lHuShyDGHcAYlGoKTS8jom0a01E+v/nnfoDvqj3KN6ca2TKFtWubtbEOdjQtPq5BKhbXDjzK+Fvo0u+tJhNXhaf9zIkfQ+9C0G1vTlSegJjhI/NzEXdzpq5Qphkpe5GAoFM1mSLeIgb5j13BZWTemSa8cLqXfaygde6qjVT6XM5DOmAEWxLwnP6zCyJg5uOOY+rmT2oGoqrUwK5vLc4p1hiJZdnQs5BXMgzCBTBseLhFfLV7EjLugyy+M+2bfVTxS223HftD+clYyLk2aLOoKSXC0PBcojKq2s6xHgbjnHHFO2ZSGtTLupyY1plDF01kDkhz3KAoEz4rDatYoZ2SrjZCgKXCGxlAgvByZa9CqNVpfrLXMPiwwndHhvrw699S79++lW7/R0aQS89z4YBYVTRidp+jYpCKT3kNkDkBaMptyWbORq3gwGMashP/SKbMpq3BhBFZyrszxeHxNv2Ad5wPFuaLp+D0KsZpaVesz/Jm2TdKvxKhVXyu8BtkCEKvRohhV9CWSVPuTMp46S7IV+IQNAth8kKQYTRTGcb+lpk70E7Y4TfSN35KsLyJNhKYkdhVEMoj4u/jA67fwnVTTVmjdsNZhcUex7LCbxK49Cpnlwgu2ilvDqtoR7I1yIjrRcJ/fhqXJy3b87YxpsiJbZ3mDQoUb/mzZZwUnTPJew8AzRtn0zhC8zXLPF/wZxzVg+pxKO5X36HcgzC4hGjoLWHxYMIRYdpkAQFR0fx3+3ndoKPA5gWM6xL3nSaNkr0UoeOcsO7ehwdV4H5pzXWvKPEs2ymySxhzmOXLupFiguCvariPtPP9oXg+ajfjAhWHozlVVIQKSzOxQGZ4rCsd+TUGiNFi4FyUsSBkaOumi84VAHB41xcO7DAYJ94ijnfDOBcQ3T2PmQlqsEJ3vlmk4JUDG/DguCkFEmM0FCyVM+EmS4xB5tOFFnkLBeaUQkFhVKFGLFoQmBR0kJ4sXjAoFR9icE36YiwsDdrGoToFgZIqj2HmtaiHfvKhdKMImGc8Ib8telIGYidFQpuJBKluHGemYGVlKkkggNPMaRWGUp/ioMSmoJnDYgdexCiSCQn1nyb8EKJeI8GmVQw+lQWfvrprFF+o8lY/2BEO32I8Z8eixItkqa4z+JgVcIHGCICGEfn8mI6MvsbwCkTvDPtpHCAH7PS3XRAVLkwXk9d41Grzb55ip/eG0wBl/5i/F775YhZNbnJppFKf/flhkkwsim5Uh2BPmTbw696ZFt569sncPHdWk9cEJYa/MYpATmxiuJeElJEpDhIs5C4Vi43z40Z5zYNV2rG8OYJUcK+W7+bV67z6/0WPByu2dMDZuSRUFCeHkn0oEowoXZK5eqTrQJO8k4vLbirr8K56pUjOVesew6DCEE5/IlUUWSKclNAMa0CMpUpR0eiy1Hkqzvwblz94KB0ZMqAWu7fcN6VA87WaonHI9MLUewoxJkhiEwaZHUWiITojQHeTJFgwzTPIab6Xzuz8Z1BnpiUdCatw74+rq5EAYc+w6qKpmy+lQnncXmO2L7PBxdGAQaoEb/geHhvHlUxn06ZdAedaXwcpOAnFz+FruSlw4rsZGNZzEWI+vcQajvXqFfmDjBDt1kF6BmhDvF/g9P8qn0Z+4WkolfweYlLZ3tzz3NjAbpjrCwZDz6ZGjcCIwOjaGUWXMmTdxHhTP/I4tXJcGWyDVHKMuJ3tONnZTWZL22wLYOueRfSNQFQgMVehajD5mvBDComWRe+7VuWCoHc+d8WbTqVA6qxu0jktQMKqHpYBl8f6BITgRKJcrMDA04jekm6E0/07QZl5tJw9OYZt/gIPveVP2hwxB+ojvgKM+Bbx2jUnvuI22xetjymYzUxlEniZEVC2AACAudDlxX8JXAChTIoE240+Q6Ct5oRMgRMYgMnjFsiUwedIEqAUpzOgqmHiUyuXAfIKC0E66GqzcZEh9+Diaio55kQyxf/7HwvTGDWFmf0FZFeYODnZPflWl5oVRpgHicpFg9LBfABVKZraPnX1nJ2nuDH8L4UGxVELBlYTdA4iGdb8tm8nYvyATYJsAGz4wJG3++10pc2i2DKwOSBztUIMHu8zZt+nD5pnXrvrIfk/oucOiLq2LJy4uBDuANdJC0aJv5CvqHbsLufOfpDfO6mct1w/lRw9yxnXMqPg5R4xRdjU9nOtDGL0ft9zqu/3FF+PvaA1boEP5wrY+PXPZzO/uOGtPPrcgbypfHtXVV1BHRxkL4kjOp3gRi65zhRGg5p3bZ57Z3lB6QyZWKtgVFA7mYUUs9OywGH3msJZa/erbU3Z2b9gQ+Fb+lWef7KrPyvfKkrwc66J4gJTRx0iY4SqYIhuOoyQigdWrZ6U+4fX4wpbnGxqaj4EC1kyjYurmS3qBffWC664bENflOd7mu6bObiDWHKwsfiEtWUsU72/xIFYoeV295aT7Dv40IpBu1JavrJj0oUzYqUFBEK5Ww5pJN2gmeb4fcmvWqZ8/cry/pcPdJKtXPXVaU0b+OjL0pxgB2u1kimc/zIrx11HfZLcSao9HTSubpvXcyGj5H367a/97J/C3fGTNtzrHt6vmH9cpGtZ82EKFsDbR12C6bhyuyPPmPdD7XpgKG3q+N/mZOtn8PJ+DVdE8asH64Yq6Js+UNYsf3NUD/0V46amfTK+vz94kU3otmsAsb123ShQXzLwhDBXDWq1ZxveXXnn9RkjyjseBl2/tmjKl0VjWJFeuRNQLUtRq0wxp+5TuvrnEPXqHydjy7elfysrW5eggf1Fi5M0XN87oD5vDfwdWrlyZmTNzwmX4iuEGfsiUCTlca7xpsTEsFD27bsuuzf9Tf93Jq2Ib7+gc35gyFmsaUec+vO9p+AMkw38Azuyce4jB92kAAAAASUVORK5CYII=",alt:"metamask"})}),(0,x.jsx)(ge,{swapInfo:n,onClose:s,insufficientEthBalance:u})]}):null}function ge(e){let{swapInfo:t,insufficientEthBalance:n,onClose:s}=e;const r=(0,U.wq)(),[o,l]=(0,i.useState)(""),[d,c]=(0,i.useState)(!1),[m,u]=(0,i.useState)({step:0,confirms:0,txid:""}),p=(0,L.I)(),g=(0,a.A)(),{address:f,memo:y,coin:{erc20Contract:j}}=t,[b]=(0,G.e6)(async()=>{var e;return r?Math.min(await(0,U.Lh)(r,j),null!==(e=t.maxSize)&&void 0!==e?e:1/0):0},(0,le.Ay)(U.Lh,r,j));if(!r)return(0,x.jsx)(U.z5,{});if(!d){var A,w,v;let e=(0,x.jsx)(h.IA,{theme:g,width:"calc(50% - .5rem)",onClick:async function(){c(!0),u({step:0,confirms:0,txid:""}),await p((async()=>{let e=parseFloat(o);if(!e||e>Number(b)||e<=0)throw new Error("Invalid amount");await(0,U.CD)({ethAccount:r,erc20Address:j,swapAddress:f,destination:y,amount:o,onStatusChange:e=>u(t=>({...t,...e}))})})(),{onError:()=>c(!1),onSuccess:()=>{}})},disabled:n,children:"Convert"});return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(h.Yq,{margin:"1rem 0",children:r&&(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(h.hE,{color:g.customPalette.grey.dark,fontSize:"1.2rem",children:[(0,x.jsx)("span",{style:{fontFamily:"Avenir Next Demi"},children:"Metamask connected:"})," ",r]})})}),(0,x.jsx)(h.Yq,{width:"90%",padding:"2rem 0",children:(0,x.jsx)(W.A,{text:`To convert ${null===t||void 0===t||null===(A=t.coin)||void 0===A?void 0:A.ticker} to SOL , your  SOL balance shouldn\u2019t be empty.`,blockHeight:"6rem",iconStyle:{margin:"0 2rem 0 3rem",height:"2.5rem"},textStyle:{fontSize:"1.4rem"}})}),(0,x.jsx)(H.zC,{value:o,maxText:`${Number(b).toFixed(6)} ${null===t||void 0===t||null===(w=t.coin)||void 0===w?void 0:w.ticker}`,onChange:e=>l(e.target.value.trim()),onMaxClick:()=>l(Number(b).toFixed(6)),placeholder:"Amount",type:"text"}),n&&(0,x.jsx)(h.Yq,{width:"90%",margin:"2rem 0 0 0",children:(0,x.jsxs)(h.hE,{color:g.customPalette.red.main,children:["Insufficient ",null===t||void 0===t||null===(v=t.coin)||void 0===v?void 0:v.ticker," for withdrawal transaction fee"]})}),(0,x.jsxs)(h.Yq,{justify:"space-between",width:"90%",margin:"2rem 0 0 0",children:[(0,x.jsx)(h._1,{theme:g,onClick:s,width:"calc(50% - .5rem)",children:"Close"}),e]})]})}return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(de.A,{activeStep:m.step,style:{marginTop:"2rem",display:"flex",flexDirection:"column",fontSize:"1.4rem",alignItems:"flex-start"},children:[(0,x.jsx)(ce.A,{style:{margin:"1rem 0",fontSize:"1.4rem"},children:(0,x.jsx)(V.gy,{children:"Approve Conversion"})}),(0,x.jsx)(ce.A,{style:{margin:"1rem 0"},children:(0,x.jsx)(V.gy,{children:"Send Funds"})}),(0,x.jsx)(ce.A,{style:{margin:"1rem 0"},children:(0,x.jsx)(V.gy,{children:"Wait for Confirmations"})})]}),2===m.step?(0,x.jsx)(x.Fragment,{children:(0,x.jsxs)(h.Yq,{margin:"2rem 0 0 0",children:[(0,x.jsx)("div",{style:{marginRight:16},children:(0,x.jsx)(he.A,{})}),(0,x.jsxs)("div",{children:[m.confirms?(0,x.jsxs)(h.hE,{children:[m.confirms," / 12 Confirmations"]}):(0,x.jsx)(h.hE,{children:"Transaction Pending"}),(0,x.jsx)(h.hE,{style:{marginLeft:"2rem"},children:(0,x.jsx)(me.A,{href:`https://etherscan.io/tx/${m.txid}`,target:"_blank",rel:"noopener",children:"View on Etherscan"})})]})]})}):null]})}var fe=n(4026),ye=n(61596),je=n(7353),be=n(12110),Ae=n(43845),we=n(94496),ve=n(17392),Se=n(53193),ke=n(79190),Ce=n(24691),Te=n(32143),De=n(15795),Pe=n(26494),Ee=n(94167),Ye=n(32069),qe=n(30079),ze=n(95874),Ie=n(34535);const Fe=(0,Ie.Ay)(ye.A)(e=>{let{theme:t}=e;return{height:"600px",display:"flex",flexDirection:"column",borderRadius:16,background:"dark"===t.palette.mode?"rgba(26, 27, 30, 0.8)":"rgba(255, 255, 255, 0.9)",backdropFilter:"blur(10px)",border:"1px solid "+("dark"===t.palette.mode?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.08)")}}),Le=(0,Ie.Ay)(je.A)(e=>{let{theme:t}=e;return{flex:1,overflowY:"auto",padding:t.spacing(2),display:"flex",flexDirection:"column",gap:t.spacing(1),"&::-webkit-scrollbar":{width:"4px"},"&::-webkit-scrollbar-track":{background:"transparent"},"&::-webkit-scrollbar-thumb":{background:"rgba(255, 255, 255, 0.2)",borderRadius:"2px"}}}),Be=(0,Ie.Ay)(be.A)(e=>{let{theme:t,isUser:n}=e;return{maxWidth:"70%",alignSelf:n?"flex-end":"flex-start",borderRadius:n?"16px 16px 4px 16px":"16px 16px 16px 4px",background:n?"linear-gradient(135deg, #651CE4 0%, #8B4CF7 100%)":"dark"===t.palette.mode?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.03)",color:n?"#fff":t.palette.text.primary,animation:"slide-up 0.3s ease-out",transition:"transform 0.2s ease","&:hover":{transform:"scale(1.02)"}}}),Ke=(0,Ie.Ay)(je.A)(e=>{let{theme:t}=e;return{padding:t.spacing(2),borderTop:"1px solid "+("dark"===t.palette.mode?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.08)")}}),Me=(0,Ie.Ay)(Ae.A)(e=>{let{theme:t}=e;return{borderRadius:12,transition:"all 0.2s ease","&:hover":{transform:"scale(1.05)"}}}),Ue=[{id:"openai",name:"OpenAI",baseUrl:"https://api.openai.com/v1",models:["gpt-4","gpt-3.5-turbo"],requiresAuth:!0},{id:"anthropic",name:"Anthropic",baseUrl:"https://api.anthropic.com/v1",models:["claude-3-opus","claude-3-sonnet","claude-3-haiku"],requiresAuth:!0},{id:"openrouter",name:"OpenRouter",baseUrl:"https://openrouter.ai/api/v1",models:["mistralai/mistral-7b-instruct","anthropic/claude-3-opus"],requiresAuth:!0},{id:"local",name:"Local Model",baseUrl:"http://localhost:1234/v1",models:["local-model"],requiresAuth:!1}],Oe=()=>{const[e,t]=(0,i.useState)([]),[n,s]=(0,i.useState)(""),[r,a]=(0,i.useState)("openai"),[o,l]=(0,i.useState)(""),[d,c]=(0,i.useState)(!1),[h,m]=(0,i.useState)(""),[u,p]=(0,i.useState)(!1),g=(0,i.useRef)(null),f=Ue.find(e=>e.id===r);(0,i.useEffect)(()=>{f&&f.models.length>0&&l(f.models[0])},[r,f]),(0,i.useEffect)(()=>{var e;null===(e=g.current)||void 0===e||e.scrollIntoView({behavior:"smooth"})},[e]);const y=async()=>{if(!n.trim()||d)return;const e={id:Date.now().toString(),content:n,isUser:!0,timestamp:new Date};t(t=>[...t,e]),s(""),c(!0);try{const e=await j(n),i={id:(Date.now()+1).toString(),content:e,isUser:!1,timestamp:new Date,provider:null===f||void 0===f?void 0:f.name};t(e=>[...e,i])}catch(i){const e={id:(Date.now()+1).toString(),content:`Error: ${i instanceof Error?i.message:"Failed to get response"}`,isUser:!1,timestamp:new Date};t(t=>[...t,e])}finally{c(!1)}},j=async e=>{if(!f)throw new Error("No provider selected");await new Promise(e=>setTimeout(e,1e3+1e3*Math.random()));const t=["I'm a mock AI assistant. In a real implementation, I would connect to the selected AI provider.","This is a demonstration of the chat interface. The actual AI integration would handle your request.","SVMSeek Chat UI is working! This would be replaced with real AI responses.","Your message has been received. In production, this would query the selected AI model."];return t[Math.floor(Math.random()*t.length)]};return(0,x.jsxs)(Fe,{className:"glass-morphism scale-in",children:[(0,x.jsxs)(je.A,{sx:{p:2,borderBottom:1,borderColor:"divider"},children:[(0,x.jsxs)(je.A,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[(0,x.jsxs)(we.A,{variant:"h6",component:"h2",sx:{display:"flex",alignItems:"center",gap:1},children:[(0,x.jsx)(Ee.A,{}),"SVMSeek AI Chat"]}),(0,x.jsxs)(je.A,{sx:{display:"flex",gap:1},children:[(0,x.jsx)(ve.A,{onClick:()=>p(!u),size:"small",children:(0,x.jsx)(Ye.A,{})}),(0,x.jsx)(ve.A,{onClick:()=>{t([])},size:"small",children:(0,x.jsx)(qe.A,{})})]})]}),u&&(0,x.jsxs)(je.A,{sx:{display:"flex",gap:2,mb:2},className:"fade-in",children:[(0,x.jsxs)(Se.A,{size:"small",sx:{minWidth:120},children:[(0,x.jsx)(ke.A,{children:"Provider"}),(0,x.jsx)(Ce.A,{value:r,label:"Provider",onChange:e=>a(e.target.value),children:Ue.map(e=>(0,x.jsx)(Te.A,{value:e.id,children:e.name},e.id))})]}),f&&(0,x.jsxs)(Se.A,{size:"small",sx:{minWidth:120},children:[(0,x.jsx)(ke.A,{children:"Model"}),(0,x.jsx)(Ce.A,{value:o,label:"Model",onChange:e=>l(e.target.value),children:f.models.map(e=>(0,x.jsx)(Te.A,{value:e,children:e},e))})]}),(null===f||void 0===f?void 0:f.requiresAuth)&&(0,x.jsx)(De.A,{size:"small",label:"API Key",type:"password",value:h,onChange:e=>m(e.target.value),sx:{minWidth:200}})]}),(0,x.jsxs)(je.A,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[(0,x.jsx)(Me,{icon:(0,x.jsx)(Ee.A,{}),label:(null===f||void 0===f?void 0:f.name)||"No Provider",size:"small",variant:"outlined"}),o&&(0,x.jsx)(Me,{label:o,size:"small",color:"primary"})]})]}),(0,x.jsxs)(Le,{children:[0===e.length&&(0,x.jsxs)(je.A,{sx:{textAlign:"center",mt:4},className:"fade-in",children:[(0,x.jsx)(Ee.A,{sx:{fontSize:48,opacity:.5,mb:2}}),(0,x.jsx)(we.A,{variant:"body1",color:"text.secondary",children:"Start a conversation with AI"}),(0,x.jsx)(we.A,{variant:"body2",color:"text.secondary",sx:{mt:1},children:"Select a provider and model to begin"})]}),e.map(e=>(0,x.jsx)(Be,{isUser:e.isUser,elevation:0,children:(0,x.jsxs)(Pe.A,{sx:{p:2,"&:last-child":{pb:2}},children:[(0,x.jsx)(we.A,{variant:"body2",children:e.content}),e.provider&&(0,x.jsxs)(we.A,{variant:"caption",sx:{opacity:.7,mt:1,display:"block"},children:["via ",e.provider]})]})},e.id)),d&&(0,x.jsxs)(je.A,{sx:{display:"flex",alignItems:"center",gap:2,mt:2},className:"slide-up",children:[(0,x.jsx)(he.A,{size:20}),(0,x.jsxs)(we.A,{variant:"body2",color:"text.secondary",children:[null===f||void 0===f?void 0:f.name," is thinking..."]})]}),(0,x.jsx)("div",{ref:g})]}),(0,x.jsx)(Ke,{children:(0,x.jsxs)(je.A,{sx:{display:"flex",gap:1},children:[(0,x.jsx)(De.A,{fullWidth:!0,multiline:!0,maxRows:3,placeholder:"Type your message...",value:n,onChange:e=>s(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),y())},variant:"outlined",size:"small",sx:{"& .MuiOutlinedInput-root":{borderRadius:3,transition:"all 0.2s ease","&:hover":{transform:"scale(1.01)"}}}}),(0,x.jsx)(ve.A,{onClick:y,disabled:!n.trim()||d,color:"primary",sx:{borderRadius:3,transition:"all 0.2s ease","&:hover":{transform:"scale(1.1)"}},children:(0,x.jsx)(ze.A,{})})]})})]})};class Ge{static async getData(){return this.isDataLoading?(await(0,m.yy)(1e3),this.getData()):0===this.tokensDataMap.size?await this.requestData():this.tokensDataMap}static async requestData(){return this.isDataLoading=!0,await(async()=>await fetch("https://api.cryptocurrencies.ai/graphql",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({operationName:"getDexTokensPrices",query:"\n  query getDexTokensPrices {\n      getDexTokensPrices {\n        symbol\n        price\n      }\n    }\n  "})}).then(e=>e.json()).then(e=>{const t=new Map;return e&&e.data&&e.data.getDexTokensPrices&&e.data.getDexTokensPrices.forEach(e=>{t.set(e.symbol,e.price)}),t}))().then(e=>{console.log("set to false",e),this.isDataLoading=!1,this.tokensDataMap=e}),this.tokensDataMap}}Ge.isDataLoading=!1,Ge.tokensDataMap=new Map;var Ze=n(75087);function Ne(e){let{open:t,onClose:n,publicKey:i,balanceInfo:s,refreshTokensData:r}=e;const o=(0,c.vT)(),[l,d]=(0,L.s)(),u=(0,a.A)(),{mint:p,symbol:g}=s||{mint:"",symbol:""};function f(){l(o.closeTokenAccount(i),{onSuccess:()=>{(0,c.eo)(o),r(),n()}})}return(0,x.jsx)(F.A,{open:t,onClose:n,fullWidth:!0,height:"auto",padding:"2rem 0",onSubmit:f,children:(0,x.jsxs)(h.Yq,{width:"90%",direction:"column",children:[(0,x.jsx)(h.Yq,{justify:"flex-start",margin:"0 0 2rem 0",children:(0,x.jsxs)(h.hE,{fontSize:"2.4rem",children:["Delete ",null!==g&&void 0!==g?g:p," Address ",(0,m.W_)(i)]})}),(0,x.jsx)(h.Yq,{children:(0,x.jsxs)(M.A,{children:["Are you sure you want to delete your ",null!==g&&void 0!==g?g:p," address"," ",i.toBase58(),"? This will permanently disable token transfers to this address and remove it from your wallet."]})}),(0,x.jsxs)(h.Yq,{margin:"2rem 0 0 0",justify:"space-between",children:[(0,x.jsx)(h._1,{theme:u,width:"calc(50% - .5rem)",onClick:n,children:"Close"}),(0,x.jsx)(h.Yr,{theme:u,onClick:f,width:"calc(50% - .5rem)",disabled:d,children:"Delete"})]})]})})}const He=(0,r.Ay)(h.Yq)`
  flex-direction: column;
  height: 100%;
  padding: 0 3rem 3rem 3rem;
  @media (max-width: 540px) {
    padding: 0;
  }
`,We=r.Ay.button`
  display: none;

  @media (max-width: 540px) {
    outline: none;
    display: block;
    width: 33.33%;
    color: ${e=>e.isTabActive?" #f5f5fb":"#96999C"};
    background: none;
    font-family: 'Avenir Next Demi';
    height: 4rem;
    cursor: pointer;
    border: none;
    border-bottom: ${e=>e.isTabActive?"0.2rem solid #f5f5fb":"0.2rem solid #96999C"};
  }
`,Re=(0,r.Ay)(h.Yq)`
  display: none;

  @media (max-width: 540px) {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`,Je=(0,r.Ay)(h.Yq)`
  max-height: 80%;
  height: 100%;
  justify-content: space-between;

  @media (max-width: 540px) {
    height: 60%;
    flex-direction: column;
  }
`,Ve=()=>{var e;const t=(0,c.vT)(),[n,r]=(0,i.useState)({publicKey:t.publicKey,isAssociatedToken:!1}),[a,o]=(0,i.useState)(!1),[l,d]=(0,i.useState)(!1),[h,u]=(0,i.useState)(!1),p=sessionStorage.getItem("hash"),[g,y]=(0,i.useState)("#add_token_to_rebalance"===p),[j,b]=(0,i.useState)("assets"),A=(0,O.w5)(),w=(0,Ze.We)(),[v,S]=(0,i.useState)(0),[k,C]=(0,i.useState)(new Map),[T,D]=(0,i.useState)(new Map),Y=null===t||void 0===t||null===(e=t.publicKey)||void 0===e?void 0:e.toString(),q=()=>S(v+1),z=T.get(n.publicKey.toString())&&n.publicKey;return(0,m.$$)(q,5e3),(0,i.useEffect)(()=>{(async()=>{const e=await Ge.getData(),t=await(0,m._S)(new f.PublicKey(Y),A,w);C(e),D(t)})()},[A,Y,JSON.stringify([...w.entries()]),v]),(0,x.jsxs)(He,{children:[window.opener&&(0,x.jsx)(s.rd,{to:"/connect_popup"}),(0,x.jsx)(P,{tokensData:k,allTokensData:T}),(0,x.jsxs)(Je,{children:[(0,x.jsxs)(Re,{children:[(0,x.jsx)(We,{isTabActive:"assets"===j,onClick:()=>{b("assets")},children:"Assets"}),(0,x.jsx)(We,{isTabActive:"activity"===j,onClick:()=>{b("activity")},children:"Activity"}),(0,x.jsx)(We,{isTabActive:"chat"===j,onClick:()=>{b("chat")},children:"AI Chat"})]}),(0,x.jsx)(E.Ay,{isActive:"assets"===j,tokensData:k,allTokensData:T,refreshTokensData:q,selectToken:r,setSendDialogOpen:o,setDepositDialogOpen:d,setShowAddTokenDialog:y,setCloseTokenAccountDialogOpen:u}),(0,x.jsx)(I,{isActive:"activity"===j}),"chat"===j&&(0,x.jsx)("div",{style:{height:"100%",padding:"2rem 0"},className:"fade-in",children:(0,x.jsx)(Oe,{})})]}),z&&(0,x.jsx)(te,{open:a,balanceInfo:T.get(n.publicKey.toString()),refreshTokensData:q,onClose:()=>o(!1),publicKey:n.publicKey}),z&&(0,x.jsx)(xe,{open:l,onClose:()=>d(!1),isAssociatedToken:n.isAssociatedToken,publicKey:n.publicKey}),(0,x.jsx)(fe.Ay,{open:g,allTokensData:T,balanceInfo:T.get(t.publicKey.toString()),refreshTokensData:q,onClose:()=>y(!1)}),z&&(0,x.jsx)(Ne,{open:h,onClose:()=>u(!1),publicKey:n.publicKey,refreshTokensData:q,balanceInfo:T.get(n.publicKey.toString())})]})};var Xe=n(44299);function Qe(e){let{match:t,location:n}=e;const i=(0,c.vT)(),[r]=(0,Xe.o6)();return(0,x.jsxs)(s.dO,{children:[i?null:r?(0,x.jsx)(s.rd,{to:"/welcome_back"}):(0,x.jsx)(s.rd,{to:"/welcome"}),(0,x.jsx)(s.qh,{path:t.url,component:Ve})]})}}}]);
//# sourceMappingURL=251.d4537fb8.chunk.js.map