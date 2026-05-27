import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Brain, TrendingUp, MessageCircle, Zap, CheckCircle2, Users } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "תוכנית AI אישית",
    desc: "Claude בונה תוכנית אימון שבועית המותאמת למטרות, לרמה ולימים הפנויים שלך — תוך שניות.",
  },
  {
    icon: Dumbbell,
    title: "מעקב תרגיל-תרגיל",
    desc: "סמן כל תרגיל בנפרד, עקוב אחרי ההתקדמות ואסוף הישגים שמוכיחים שאתה הולך קדימה.",
  },
  {
    icon: MessageCircle,
    title: "צ׳אט AI זמין 24/7",
    desc: "שאל שאלות על כושר ותזונה וקבל תשובות שמכירות את התוכנית שלך ואת המטרות שלך.",
  },
  {
    icon: TrendingUp,
    title: "מאמן שרואה הכל",
    desc: "המאמן עוקב בזמן אמת אחרי ההתקדמות שלך, רואה את גרפי הביצועים ויכול לפנות אליך ישירות.",
  },
]

const steps = [
  {
    num: "1",
    title: "נרשמים ועונים על שאלון קצר",
    desc: "מה המטרה שלך, רמת הכושר, ובאילו ימים אתה יכול להתאמן.",
  },
  {
    num: "2",
    title: "AI בונה לך תוכנית אישית",
    desc: "תוך שניות מקבלים תוכנית שבועית מלאה עם תרגילים, סטים, חזרות והוראות.",
  },
  {
    num: "3",
    title: "מתאמנים, מסמנים, מתקדמים",
    desc: "כל אימון — מסמנים תרגילים, מקבלים הישגים, ורואים את הגרף עולה.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <span className="font-bold text-lg">סטודיו איתי</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            כניסה
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            הצטרפות
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center gap-6 px-6 py-20 md:py-32">
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Zap className="size-3" />
            מופעל ע״י Claude AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl leading-tight">
            הכושר שלך,
            <br />
            בהתאמה אישית מלאה
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            תוכנית אימון שנבנית עבורך על ידי AI, מאמן אישי שעוקב אחר ההתקדמות שלך, וצ׳אט זמין בכל שעה.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
              התחל בחינם ←
            </Link>
            <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline" })}>
              כבר יש לי חשבון
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-green-500" />
              ללא כרטיס אשראי
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-green-500" />
              תוכנית ב-2 דקות
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-green-500" />
              בעברית מלאה
            </span>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">הכל במקום אחד</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map(f => (
                <div key={f.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16">
          <div className="max-w-2xl mx-auto flex flex-col gap-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center">מתחילים תוך 3 דקות</h2>
            <div className="flex flex-col gap-8">
              {steps.map(s => (
                <div key={s.num} className="flex items-start gap-4">
                  <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{s.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For trainers */}
        <section className="px-6 py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto rounded-2xl border bg-card p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="size-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-xl font-bold mb-2">את/ה מאמן כושר?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                עקוב אחרי כל הלקוחות שלך ממקום אחד — ראה מי מתאמן ומי לא, ניהול תוכניות, היסטוריית צ׳אט, וגרפי ביצועים.
              </p>
            </div>
            <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0" })}>
              כניסה למאמן
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold">מוכן להתחיל?</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            הצטרף לסטודיו איתי וקבל תוכנית אימון אישית תוך דקות
          </p>
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            הצטרף עכשיו ←
          </Link>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        © 2025 סטודיו איתי · מופעל ע״י Claude AI
      </footer>
    </div>
  )
}
