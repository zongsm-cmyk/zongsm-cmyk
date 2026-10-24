export const GUIDE = 'https://askoure-systems.floot.app/ar/systeme-io-free-funnel';
export const VERIFIED_REFERRAL = 'https://systeme.io/fr?sa=sa0284636962507f2a1b5beb2d42ca71bf15989a0b';

export const QUESTIONS = [
  { id: 'goal', title: 'ما المهمة التي تريد إنجازها؟', choices: [
    ['landing', 'إنشاء صفحة هبوط لجلب العملاء'],
    ['leads', 'جمع طلبات العملاء وتنظيمها'],
    ['email', 'إرسال رسائل بريدية للمهتمين'],
    ['automation', 'أتمتة أعمال متكررة'],
    ['media', 'صناعة فيديو أو صوت للمشروع']
  ]},
  { id: 'experience', title: 'ما مستوى خبرتك مع الأدوات الرقمية؟', choices: [
    ['new', 'مبتدئ'],['mid', 'متوسط'],['pro', 'متقدم']
  ]},
  { id: 'budget', title: 'كيف تفضّل البدء؟', choices: [
    ['free', 'مجاني أولاً'],['small', 'ميزانية شهرية محدودة'],['flex', 'يمكنني الدفع إن ظهرت قيمة واضحة']
  ]},
  { id: 'urgency', title: 'ما التوقيت المناسب؟', choices: [
    ['test', 'أختبر الفكرة'],['soon', 'أريد الإطلاق قريبًا'],['compare', 'أقارن الخيارات قبل القرار']
  ]},
];

export function recommend(answers) {
  if (!answers || !['landing','leads','email','automation','media'].includes(answers.goal)) {
    return {kind:'none', title:'لا نوصي بأي أداة قبل تحديد هدف واضح', reason:'ابدأ بوصف المهمة والنتيجة التي تريدها بدقة.'};
  }
  const beginner = answers.experience === 'new';
  const lowBudget = answers.budget === 'free';
  switch (answers.goal) {
    case 'landing': return {
      kind: 'systeme', title:'جرّب صفحة هبوط بسيطة قبل أي اشتراك',
      reason: `${beginner?'إذا كنت مبتدئًا، ابدأ بمحرر بدون برمجة. ':'حدد عرضًا واحدًا وزرًا واضحًا. '}${lowBudget?'اختبر الخطة المجانية ضمن حدودها الحالية.':'راقب النتائج قبل دفع تكلفة مزايا إضافية.'}`,
      steps:['اكتب وعدًا واحدًا للعميل','أنشئ صفحة بسيطة مع دعوة واضحة','اختبر الصفحة على الهاتف قبل مشاركتها']
    };
    case 'leads': return {
      kind: 'systeme', title:'اختبر رحلة واضحة لجمع طلبات العملاء',
      reason:'ابدأ بصفحة تسجيل أو نموذج بسيط، ثم اختبر وصول الطلب والتسليم قبل مشاركة الرابط.',
      steps:['حدد المعلومات الضرورية فقط','تأكد أن زر الإرسال يحفظ الطلب فعلًا','قدّم موردًا مجانيًا حقيقيًا إن وعدت به']
    };
    case 'email': return {
      kind: 'category', title:'ابحث عن خدمة قائمة بريدية توافق احتياجك',
      reason:'قارن إمكانات الموافقة على الاشتراك والتسليم وإدارة الانسحاب. لا نملك حتى الآن رابط إحالة شخصيًا مؤكدًا لعروض البريد الأخرى.',
      steps:['حدد عدد المستلمين وطريقة جمع موافقتهم','قارن حدود الخطط المجانية والشروط','اختبر وصول أول رسالة إلى عنوان تملكه']
    };
    case 'automation': return {
      kind: 'category', title:'حدد العملية المتكررة أولًا قبل شراء أداة أتمتة',
      reason:'ارسم خطوات المهمة يدويًا ثم قارن حلول الأتمتة على أساس التكاملات والأمان والقيود.',
      steps:['وثّق المدخلات والنتائج المطلوبة','جرّب مسارًا واحدًا مع خطوة مراجعة بشرية','قارن التكلفة بما توفره العملية']
    };
    case 'media': return {
      kind: 'category', title:'اختبر سيناريو المحتوى قبل شراء أداة صوت أو فيديو',
      reason:'ابدأ بمخطط تصوير قصير واضح. روابط الشراكة الخاصة بخدمات الصوت والفيديو لم تُعتمد لدينا بعد.',
      steps:['حدد جمهور الفيديو والرسالة','ضع نصًا لا يتضمن ادعاءات غير مثبتة','اختبر فيديو بسيطًا قبل التوسع']
    };
  }
}

export function isSafeExternalReferralLink(anchor) {
  return anchor.href === VERIFIED_REFERRAL && ['sponsored','noopener','noreferrer'].every(x=>anchor.rel.split(/\s+/).includes(x));
}