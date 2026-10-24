import {QUESTIONS, GUIDE, VERIFIED_REFERRAL, recommend} from './logic.mjs';
const root = document.querySelector('#tool');
let step = 0;
const answers = {};
function element(tag, attrs={}, children=[]) {
  const node = document.createElement(tag);
  for (const [key,val] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = val;
    else if (key === 'class') node.className = val;
    else node.setAttribute(key, val);
  }
  for(const child of children) node.append(child);
  return node;
}
function showQuestion() {
  const q = QUESTIONS[step];
  root.replaceChildren();
  const section=element('section',{class:'card', 'aria-label':`السؤال ${step+1} من ${QUESTIONS.length}`});
  section.append(element('p',{class:'step-label',text:`السؤال ${step+1} / ${QUESTIONS.length}`}));
  section.append(element('progress',{value:String(step),max:String(QUESTIONS.length),'aria-label':'تقدّم التقييم'}));
  section.append(element('h2',{text:q.title}));
  const choices=element('div',{class:'choices',role:'group','aria-label':q.title});
  for(const [value,label] of q.choices){
    const button=element('button',{class:'choice',type:'button',text:label});
    if(answers[q.id] === value) button.setAttribute('aria-pressed','true');
    button.addEventListener('click',()=>{answers[q.id]=value;if(step<QUESTIONS.length-1){step++;showQuestion()}else{showResult()}});
    choices.append(button);
  }
  section.append(choices);
  if(step){const back=element('button',{type:'button',class:'back',text:'← الرجوع للسؤال السابق'});back.addEventListener('click',()=>{step--;showQuestion()});section.append(back)}
  root.append(section);
  section.querySelector('h2').setAttribute('tabindex','-1');
  section.querySelector('h2').focus();
}
function showResult(){
  const result=recommend(answers);
  const section=element('section',{class:'card result',role:'region','aria-label':'التوصية'});
  section.append(element('p',{class:'step-label',text:'توصية مبدئية غير مدفوعة'}));
  section.append(element('h2',{text:result.title}));
  section.append(element('p',{text:result.reason}));
  if(result.steps?.length){const ul=element('ul');for(const x of result.steps)ul.append(element('li',{text:x}));section.append(ul)}
  if(result.kind==='systeme'){
    const a=element('a',{href:GUIDE,class:'primary',text:'اقرأ الدليل العربي المجاني أولًا ←'});
    const b=element('a',{href:VERIFIED_REFERRAL,class:'affiliate',target:'_blank',rel:'sponsored noopener noreferrer',text:'الانتقال إلى systeme.io (رابط إحالة) ↗'});
    section.append(a,b,element('p',{class:'disclosure',text:'إفصاح تجاري: قد نحصل على عمولة إذا اشتريت اشتراكًا مؤهلًا عبر رابط الإحالة، دون زيادة في التكلفة عليك. البدء بالخطة المجانية لا يضمن حصولنا على عمولة ولا يضمن لك تحقيق مبيعات.'}));
  } else {
    section.append(element('p',{class:'disclosure',text:'لا نعرض رابط إحالة غير معتمد. إن لم تكن تحتاج إلى اشتراك مدفوع الآن، فلا تشترِ أداة لمجرد وجود توصية.'}));
  }
  const again=element('button',{type:'button',class:'back',text:'أعد التقييم'});
  again.addEventListener('click',()=>{step=0;for(const k of Object.keys(answers))delete answers[k];showQuestion()});
  section.append(again);
  root.replaceChildren(section);section.querySelector('h2').setAttribute('tabindex','-1');section.querySelector('h2').focus();
}
showQuestion();