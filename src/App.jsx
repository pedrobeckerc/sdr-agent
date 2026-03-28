import{useState,useRef}from"react";
const DARK={bg:"#0a0a0a",bgCard:"#111",bgTag:"#1a1a1a",border:"#2a2a2a",borderMid:"#3f3f3f",text:"#e3e3e3",textMuted:"#818181",textHint:"#444",accentBg:"#e3e3e3",accentTxt:"#0a0a0a",green:"#4ade80",greenBg:"#0d2a1a",amber:"#fbbf24",amberBg:"#1f1500",red:"#f87171",redBg:"#2a0a0a",blue:"#60a5fa",blueBg:"#0a1628",purple:"#c084fc",purpleBg:"#1a0a2a",linkedin:"#0a66c2",linkedinBg:"#071c30"};
const LIGHT={bg:"#f5f5f3",bgCard:"#fff",bgTag:"#ebebea",border:"#e0e0de",borderMid:"#c8c8c6",text:"#191919",textMuted:"#6b6b6b",textHint:"#aaa",accentBg:"#191919",accentTxt:"#fff",green:"#16a34a",greenBg:"#f0fdf4",amber:"#d97706",amberBg:"#fffbeb",red:"#dc2626",redBg:"#fef2f2",blue:"#2563eb",blueBg:"#eff6ff",purple:"#7c3aed",purpleBg:"#f5f3ff",linkedin:"#0a66c2",linkedinBg:"#e8f0f9"};
const UTALK="https://app-utalk.umbler.com/api";
async function utalk(e,t="GET",o,n){const r=await fetch(UTALK+e,{method:t,headers:{"Content-Type":"application/json",Authorization:"Bearer "+n},body:o?JSON.stringify(o):void 0});return{ok:r.ok,status:r.status,data:await r.json().catch(()=>({}))}}
async function utalkConnect(token){const me=await utalk("/v1/member/me","GET",void 0,token);if(!me.ok)throw new Error("Token inválido ("+me.status+")");const orgs=me.data?.organizations??me.data??[];const org=Array.isArray(orgs)?orgs[0]:orgs;if(!org)throw new Error("Nenhuma organização encontrada");const orgId=org.id??org.organizationId;const ch=await utalk("/v1/channels?organizationId="+orgId,"GET",void 0,token);const channels=ch.data?.items??ch.data??[];return{orgId,orgName:org.organizationName??org.name??orgId,channels:Array.isArray(channels)?channels:[]}}
async function utalkSend(t,o,c,p,n,m){return utalk("/v1/messages/simplified","POST",{OrganizationId:o,ChannelId:c,ToPhone:p.replace(/\D/g,""),ContactName:n,Message:m},t)}
async function utalkCreateContact(t,o,p,n,e){return utalk("/v1/contacts?organizationId="+o,"POST",{OrganizationId:o,Phone:p.replace(/\D/g,""),Name:n,Email:e||void 0},t)}
const NAV_MAIN=[{id:0,label:"Overview"},{id:1,label:"ICP & Tom"},{id:2,label:"Prospecção"},{id:3,label:"Campanhas"},{id:4,label:"Respostas"},{id:5,label:"Reuniões"},{id:6,label:"Logs"},{id:7,label:"Configurações"}];
const STATUS={novo:{label:"Novo",k:"blue"},contatado:{label:"Contatado",k:"amber"},respondeu:{label:"Respondeu",k:"green"},reunião:{label:"Reunião",k:"purple"},descartado:{label:"Descartado",k:"red"}};
const defaultICP={segmentos:["SaaS B2B","E-commerce","Agências Digitais"],cargos:["CEO","CMO","Head de Vendas","Fundador"],tamanho:"10-200",regioes:["Brasil","Portugal"],dores:["baixa taxa de conversão","dificuldade em escalar vendas","falta de previsibilidade"],tom:"consultivo",formalidade:65,agressividade:30,personalização:85};
const defaultRules=[{id:1,campo:"cargo",op:"contém",valor:"CEO,CMO,Head,Diretor,Fundador",pts:30,on:true},{id:2,campo:"segmento",op:"in",valor:"SaaS,Ecommerce,Agência",pts:25,on:true},{id:3,campo:"tamanho",op:">=",valor:"10",pts:20,on:true},{id:4,campo:"linkedin",op:"existe",valor:"true",pts:15,on:true},{id:5,campo:"email_válido",op:"=",valor:"true",pts:10,on:true}];
const initProspects=[{id:1,nome:"Ana Lima",empresa:"NovaTech SaaS",cargo:"CEO",telefone:"",email:"ana@novatech.io",linkedin:"linkedin.com/in/analima",seg:"SaaS B2B",tam:45,score:88,status:"novo",canal:"talk",origem:"mock"},{id:2,nome:"Carlos Mendes",empresa:"ShopMax",cargo:"Head Vendas",telefone:"",email:"carlos@shopmax.com",linkedin:"linkedin.com/in/carlosmendes",seg:"E-commerce",tam:120,score:75,status:"contatado",canal:"talk",origem:"mock"},{id:3,nome:"Fernanda Rocha",empresa:"AgênciaFX",cargo:"Fundadora",telefone:"",email:"fe@agenciafx.com",linkedin:"linkedin.com/in/ferochaaa",seg:"Agências",tam:18,score:92,status:"respondeu",canal:"email",origem:"mock"},{id:4,nome:"Ricardo Souza",empresa:"FinPulse",cargo:"CMO",telefone:"",email:"rsouza@finpulse.com",linkedin:"linkedin.com/in/ricardosouza",seg:"SaaS B2B",tam:67,score:81,status:"reunião",canal:"email",origem:"mock"},{id:5,nome:"Julia Castro",empresa:"EcoStore",cargo:"Diretora",telefone:"",email:"julia@ecostore.com",linkedin:"linkedin.com/in/juliacastro",seg:"E-commerce",tam:33,score:70,status:"novo",canal:"talk",origem:"mock"}];
const initLogs=[{ts:"08:14",tipo:"talk",nome:"Ana Lima",msg:"Mensagem enviada via Umbler Talk",ok:true},{ts:"08:22",tipo:"ia",nome:"Fernanda Rocha",msg:"Resposta: INTERESSE ALTO — objeção tratada",ok:true},{ts:"08:35",tipo:"agenda",nome:"Ricardo Souza",msg:"Reunião agendada 02/04 às 15h",ok:true}];
const initMeetings=[{id:1,nome:"Ricardo Souza",empresa:"FinPulse",data:"02/04/2026",hora:"15:00",canal:"Google Meet",status:"confirmada"},{id:2,nome:"Fernanda Rocha",empresa:"AgênciaFX",data:"03/04/2026",hora:"10:30",canal:"Zoom",status:"pendente"}];
async function callClaude(s,u){const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:s,messages:[{role:"user",content:u}]})});return(await r.json()).content?.[0]?.text||""}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const F="'General Sans Variable','Inter',system-ui,sans-serif";
// See full source at https://claude.ai — App.jsx generated by Claude SDR Agent
export default function App(){
  const[mode,setMode]=useState("dark");
  const[tab,setTab]=useState(0);
  const[conn,setConn]=useState({token:"",orgId:"",orgName:"",channelId:"",channels:[]});
  const t=mode==="dark"?DARK:LIGHT;
  return(
    <div style={{fontFamily:F,background:t.bg,minHeight:"100vh",color:t.text,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:16}}>🤖</div>
        <div style={{fontSize:18,fontWeight:500,letterSpacing:"-0.03em",marginBottom:8}}>SDR Agent</div>
        <div style={{fontSize:13,color:t.textMuted}}>Para usar o código completo, importe o App.jsx do artifact do Claude.</div>
        <div style={{fontSize:11,color:t.textHint,marginTop:16,fontFamily:"monospace"}}>npm install && npm run dev</div>
      </div>
    </div>
  );
}
