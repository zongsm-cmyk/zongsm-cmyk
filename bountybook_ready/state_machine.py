class StateMachine:
    def __init__(self, initial_state):
        self._state = initial_state
        self._transitions = {}

    @property
    def state(self):
        return self._state

    def add_transition(self, from_state, event, to_state, guard=None):
        self._transitions.setdefault((from_state, event), []).append((to_state, guard))

    def trigger(self, event, **context):
        transitions = self._transitions.get((self._state, event))
        if not transitions:
            raise ValueError(f"No transition for event {event!r} from state {self._state!r}")
        for to_state, guard in transitions:
            if guard is None or bool(guard(context)):
                self._state = to_state
                return True
        return False
