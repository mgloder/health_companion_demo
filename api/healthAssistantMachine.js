const COLLECT_USER_SYMPTOMS = {
  type: "function",
  function: {
    name: "collect_user_symptoms",
    parameters: {
      type: "object",
      properties: {
        symptoms: { type: "string", description: "主要病症" },
        others: { type: "string", description: "关于症状的其他信息" },
      },
      required: ["primary_symptoms"],
    },
    description: "收集用户提供的症状相关信息",
  },
};

const USER_CONFIRM_DIAGNOSIS = {
  type: "function",
  function: {
    name: "user_confirm_diagnosis",
    description: "用户确认病情与 AI 描述一致",
  },
};

const USER_REJECT_DIAGNOSIS = {
  type: "function",
  function: {
    name: "user_reject_diagnosis",
    description: "用户确认病情与 AI 描述不一致",
  },
};

export const STEPS = {
  COLLECT_INFO: 1,
  CONFIRM_WITH_USER: 2,
  GENERATE_INSURANCE_COVERAGE: 3,
  DOCUMENT_Q_AND_A: 4,
  DOCTOR_RECOMMENDATION: 5,
  USER_CONFIRM_RECOMMENDATION: 6
};

export class ChatManager {
  constructor() {
    this.sessions = new Map();
    this.MAX_FOLLOW_UP_QUESTIONS = 2;
  }

  initSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        currentState: STEPS.COLLECT_INFO,
        followUpCount: 0
      });
    }
  }

  update_state(sessionId, action) {
    this.initSession(sessionId);
    const session = this.sessions.get(sessionId);

    // Special case for COLLECT_INFO
    if (session.currentState === STEPS.COLLECT_INFO) {
      if (session.followUpCount >= this.MAX_FOLLOW_UP_QUESTIONS) {
        session.currentState = STEPS.CONFIRM_WITH_USER;
      }
      return session.currentState;
    }

    // Special case for CONFIRM_WITH_USER
    if (session.currentState === STEPS.CONFIRM_WITH_USER) {
      if (action === 'BACK') {
        session.currentState = STEPS.COLLECT_INFO;
        session.followUpCount = 0;  // Reset count when returning to COLLECT_INFO
      }
      return session.currentState;
    }

    // For all other states
    if (action === 'NEXT' && session.currentState < STEPS.USER_CONFIRM_RECOMMENDATION) {
      session.currentState += 1;
    } 

    return session.currentState;
  }

  incrementFollowUpCount(sessionId) {
    this.initSession(sessionId);
    const session = this.sessions.get(sessionId);
    session.followUpCount += 1;
  }

  resetFollowUpCount(sessionId) {
    this.initSession(sessionId);
    const session = this.sessions.get(sessionId);
    session.followUpCount = 0;
  }

  getState(sessionId) {
    this.initSession(sessionId);
    return this.sessions.get(sessionId).currentState;
  }

  getFollowUpCount(sessionId) {
    this.initSession(sessionId);
    return this.sessions.get(sessionId).followUpCount;
  }

  getCurrentStep(sessionId) {
    this.initSession(sessionId);
    return this.sessions.get(sessionId).currentState;
  }

  getTools(sessionId) {
    if (this.getCurrentStep(sessionId) === STEPS.COLLECT_INFO) {
      return [COLLECT_USER_SYMPTOMS];
    } else if (this.getCurrentStep(sessionId) === STEPS.CONFIRM_WITH_USER) {
      return [USER_CONFIRM_DIAGNOSIS, USER_REJECT_DIAGNOSIS];
    } else {
      return [];
    }
  }

  update_state_with_tool_call(sessionId, toolCall) {
    const { name } = toolCall.function;

    switch (name) {
      case 'collect_user_symptoms':
        console.log(sessionId, this.getFollowUpCount(sessionId));
        this.incrementFollowUpCount(sessionId);
        this.update_state(sessionId, 'NEXT');
        break;
        
      case 'user_confirm_diagnosis':
        this.update_state(sessionId, 'NEXT');
        break;
        
      case 'user_reject_diagnosis':
        this.resetFollowUpCount(sessionId);
        this.update_state(sessionId, 'BACK');
        break;
    }
  }
}
