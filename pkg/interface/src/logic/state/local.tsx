import React, { ReactNode } from 'react';
import f from 'lodash/fp';
import create, { State }  from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { BackgroundConfig, RemoteContentPolicy, TutorialProgress, tutorialProgress } from '~/types/local-update';

export interface LocalState extends State {
  hideAvatars: boolean;
  hideNicknames: boolean;
  remoteContentPolicy: RemoteContentPolicy;
  tutorialProgress: TutorialProgress;
  tutorialRef: HTMLElement | null,
  hideTutorial: () => void;
  nextTutStep: () => void;
  prevTutStep: () => void;
  setTutorialRef: (el: HTMLElement | null) => void;
  dark: boolean;
  background: BackgroundConfig;
  omniboxShown: boolean;
  suspendedFocus?: HTMLElement;
  toggleOmnibox: () => void;
  set: (fn: (state: LocalState) => void) => void
}
export const selectLocalState =
  <K extends keyof LocalState>(keys: K[]) => f.pick<LocalState, K>(keys);

const useLocalState = create<LocalState>(persist((set, get) => ({
  dark: false,
  background: undefined,
  hideAvatars: false,
  hideNicknames: false,
  tutorialProgress: 'hidden',
  tutorialRef: null,
  setTutorialRef: (el: HTMLElement | null) => set(produce((state) => {
    state.tutorialRef = el;
  })),
  hideTutorial: () => set(produce((state) => {
    state.tutorialProgress = 'hidden';
    state.tutorialRef = null;
  })),
  nextTutStep: () => set(produce((state) => {
    const currIdx = tutorialProgress.findIndex(p => p === state.tutorialProgress);
    if(currIdx < tutorialProgress.length) {
      state.tutorialProgress = tutorialProgress[currIdx + 1];
    }
  })),
  prevTutStep: () => set(produce((state) => {
    const currIdx = tutorialProgress.findIndex(p => p === state.tutorialProgress);
    if(currIdx > 0) {
      state.tutorialProgress = tutorialProgress[currIdx - 1];
    }
  })),
  remoteContentPolicy: {
    imageShown: true,
    audioShown: true,
    videoShown: true,
    oembedShown: true
  },
  omniboxShown: false,
  suspendedFocus: undefined,
  toggleOmnibox: () => set(produce((state) => {
    state.omniboxShown = !state.omniboxShown;
    if (typeof state.suspendedFocus?.focus === 'function') {
      state.suspendedFocus.focus();
      state.suspendedFocus = undefined;
    } else {
      state.suspendedFocus = document.activeElement;
      state.suspendedFocus.blur();
    }
  })),
  set: fn => set(produce(fn))
  }), {
    blacklist: [
      'suspendedFocus', 'toggleOmnibox', 'omniboxShown', 'tutorialProgress',
      'prevTutStep', 'nextTutStep', 'tutorialRef', 'setTutorialRef'
    ],
  name: 'localReducer'
}));

function withLocalState<P, S extends keyof LocalState>(Component: any, stateMemberKeys?: S[]) {
  return React.forwardRef((props: Omit<P, S>, ref) => {
    const localState = stateMemberKeys ? useLocalState(
      state => stateMemberKeys.reduce(
        (object, key) => ({ ...object, [key]: state[key] }), {}
      )
    ): useLocalState();
    return <Component ref={ref} {...localState} {...props} />;
  });
}

export { useLocalState as default, withLocalState };
