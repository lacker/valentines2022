#!/usr/bin/env python
"""
Generate a list of possible palindromes, in
taco_cat
format.

We are looking for palindromes from 7 to 12 characters in length.
The palindrome can contain up to three words.
"""

MIN_WORD = 3
MIN_PALINDROME = 7
MAX_PALINDROME = 12


def reverse_word(word):
    return "".join(reversed(word))


def is_palindrome(word):
    return reverse_word(word) == word


assert __name__ == "__main__"

# words[length] is a set of words of that length
words = {}
for length in range(MIN_WORD, MAX_PALINDROME + 1):
    words[length] = set()

# Populate the word-sets
corncob = set()
for line in open("corncob_lowercase.txt"):
    word = line.strip()
    corncob.add(word)

google = set()
for line in open("google10k.txt"):
    word = line.strip()
    google.add(word)

for word in corncob.intersection(google):
    if MIN_PALINDROME <= len(word) <= MAX_PALINDROME and is_palindrome(word):
        print(word)
    if len(word) in words:
        words[len(word)].add(word)


def is_word(word):
    return len(word) in words and word in words[len(word)]


def iter_words():
    for wordset in words.values():
        for word in wordset:
            yield word


# The multi-word things we already printed out
PRINTED = set()


def report(words):
    if len(words) == 3 and len(words[1]) == 3:
        # Too unfun to guess the middle word
        return
    s = "_".join(words)
    if s in PRINTED:
        return
    print(s)
    PRINTED.add(s)


def search_with(words):
    """
    Look for a single word that makes this phrase a palindrome.
    """
    letters = "".join(words)

    if 2 * len(letters) <= MIN_PALINDROME:
        # Find this from longer-word-first
        return

    for target_length in range(MIN_PALINDROME, MAX_PALINDROME + 1):
        missing_length = target_length - len(letters)
        if missing_length < MIN_WORD:
            continue

        # What would we need to append?
        target_after = reverse_word(letters[:missing_length])
        if is_word(target_after):
            candidate = words + [target_after]
            if is_palindrome("".join(candidate)):
                report(candidate)

        # What would we need to prepend?
        target_before = reverse_word(letters[-missing_length:])
        if is_word(target_before):
            candidate = [target_before] + words
            if is_palindrome("".join(candidate)):
                report(candidate)


# For every possibility for the first two, check if some third words
for word1 in iter_words():
    search_with([word1])
    max_word2_length = MAX_PALINDROME - len(word1) - MIN_WORD
    for i, wordset in sorted(words.items()):
        if i > max_word2_length:
            break
        for word2 in wordset:
            search_with([word1, word2])
