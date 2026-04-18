import type { FC } from 'preact/compat'

import {
  IconTypeScript,
  IconNodeJs,
  IconPostgreSQL,
  IconRedis,
  IconPHP,
  IconKotlin
} from '@starkow.dev/icons'

import { Skill } from '../../components'

import './style.css'

export const SkillsSection: FC = () => (
  <section id='skills'>
    <h2>skills <span class='text-half-visible'>(and not only)</span></h2>

    <p class='skills-prose'>
      i create with {' '}
      <Skill name='typescript' Icon={IconTypeScript} note='my beloved' since='2021-01-01' /> {' '}
      on {' '}
      <Skill name='node.js' Icon={IconNodeJs} note='still better than python' since='2017-01-01' />, {' '}
      store things in {' '}
      <Skill name='postgres' Icon={IconPostgreSQL} note='fuck mongodb' /> {' '}
      & {' '}
      <Skill name='redis' Icon={IconRedis} note='when too lazy to setup psql' />, {' '}
      create grammar of programming languages with {' '}
      <Skill name='tree-sitter' note='tier 1 btw' />. {' '}
      used to hate {' '}
      <Skill name='AI' note='110100001011000111010000101110111101000110001111' /> {' '}
      and everything related to it, but got used to it. {' '}
      oh and also i adore {' '}
      <Skill name='cats 🐈' note='meow?' /> {'>:)'}
    </p>

    <p class='info-line'>
      <span class='info-label'>currently learning:</span> {' '}
      <Skill name='mtproto' note='actually pretty interesting' />
      <span class='skill-sep'>•</span>
      <Skill name='kotlin' Icon={IconKotlin} note='i LOVE their syntactic sugar' />
      <span class='skill-sep'>•</span>
      <Skill name='how to talk to people' note='¯\_(ツ)_/¯' />
    </p>

    <p class='info-line'>
      <span class='info-label'>things i dislike:</span> {' '}
      <Skill name='php' Icon={IconPHP} note='explode() my ass' disliked />
      <span class='skill-sep'>•</span>
      <Skill name='people' note='so what' disliked />
      <span class='skill-sep'>•</span>
      <Skill name='uni' note='booooring' disliked />
      <span class='skill-sep'>•</span>
      <Skill name='$$$ money' note='unironically i hate it' disliked />
    </p>

    <p class='info-line'>
      <span class='info-label'>someday i want to build:</span> {' '}
      <Skill name='full-ass text RPG' note='with ECS in mind!' />
      <span class='skill-sep'>•</span>
      <Skill name='a house' note='no like literal house like 🏠' />
    </p>
  </section>
)
