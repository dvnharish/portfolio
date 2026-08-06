import { ScrollyCanvas } from '@/components/ScrollyCanvas'
import { Overlay } from '@/components/Overlay'
import { ScrollProgressRail } from '@/components/ScrollProgressRail'
import { PortraitBand } from '@/components/PortraitBand'
import { About } from '@/components/sections/About'
import { AgenticEngineering } from '@/components/sections/AgenticEngineering'
import { Domains } from '@/components/sections/Domains'
import { Approach } from '@/components/sections/Approach'
import { Experience } from '@/components/sections/Experience'
import { Impact } from '@/components/sections/Impact'
import { Projects } from '@/components/sections/Projects'
import { Skills } from '@/components/sections/Skills'
import { Timeline } from '@/components/sections/Timeline'
import { Footer } from '@/components/sections/Footer'

export default function Page() {
  return (
    // `relative` is load-bearing: framer's useScroll resolves each track's
    // offset through its positioned ancestor chain, and a static ancestor
    // yields wrong offsets (and a console warning).
    <main className="relative">
      <ScrollProgressRail />

      <ScrollyCanvas>
        <Overlay />
      </ScrollyCanvas>

      <About />
      <AgenticEngineering />
      <Domains />
      <Approach />
      <PortraitBand />
      <Experience />
      <Impact />
      <Projects />
      <Skills />
      <Timeline />
      <Footer />
    </main>
  )
}
