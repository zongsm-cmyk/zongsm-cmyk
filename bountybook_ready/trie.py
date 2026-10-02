class Trie:
    def __init__(self):
        self._root = {}
        self._end = object()
        self._size = 0

    def insert(self, word: str) -> None:
        node = self._root
        for ch in word:
            node = node.setdefault(ch, {})
        if self._end not in node:
            node[self._end] = True
            self._size += 1

    def search(self, word: str) -> bool:
        node = self._root
        for ch in word:
            nxt = node.get(ch)
            if nxt is None:
                return False
            node = nxt
        return self._end in node

    def starts_with(self, prefix: str) -> bool:
        if prefix == "":
            return self._size > 0
        node = self._root
        for ch in prefix:
            nxt = node.get(ch)
            if nxt is None:
                return False
            node = nxt
        return True
