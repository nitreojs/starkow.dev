import { FC, useEffect, useState } from 'preact/compat'
import { ButtonsBlockSection, DonationsSection, FooterSection, NotificationsSection, SkillsSection, SpotifySection, WallSection, WelcomeSection, WhatDoIDoSection } from '../../sections'
import type { Project, ProjectsStatus } from '../../sections'
import { API_URL } from '../../shared'
import * as Icons from '@starkow.dev/icons'

export const MainPage: FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsStatus, setProjectsStatus] = useState<ProjectsStatus>('loading')

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(r => {
        if (!r.ok) throw new Error(`status ${r.status}`)

        return r.json()
      })
      .then((data: Project[]) => {
        setProjects(Array.isArray(data) ? data : [])
        setProjectsStatus('ready')
      })
      .catch(() => setProjectsStatus('error'))
  }, [])

  return (
    <>
      <NotificationsSection />
      <WelcomeSection />
      <WhatDoIDoSection projects={projects} status={projectsStatus} />
      <SkillsSection />
      <SpotifySection />
      <WallSection />
      <DonationsSection />
      <ButtonsBlockSection />

      <hr />

      <FooterSection />

      <section class='barcode-container'>
        <Icons.IconQRCode />
      </section>
    </>
  )
}