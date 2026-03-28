use itertools::Itertools;
use js_sys::*;
use wasm_bindgen::prelude::wasm_bindgen;

/// Type alias for start string in delimiter pairs
type StartStr<'a> = &'a str;

/// Type alias for end string in delimiter pairs
type EndStr<'a> = &'a str;

/// Action to take when a substring is found between delimiters
#[derive(Eq, PartialEq, Hash)]
enum ConsumeAction {
    /// Include the substring in the result
    Take,
    /// Exclude the substring from the result
    Ignore,
}

/// Tuple defining start and end delimiters for substring extraction
/// 
/// Contains:
/// - Start delimiter string
/// - End delimiter string  
/// - Escape sequences to handle within the substring
/// - Action to take (Take or Ignore)
#[derive(Eq, PartialEq, Hash)]
struct StartEndTuple<'a>(
    /// Start delimiter string
    StartStr<'a>,
    /// End delimiter string
    EndStr<'a>,
    /// Escape sequences to handle within the substring (escape_string, replacement_string)
    &'a [(&'a str, &'a str)],
    /// Action to take when substring is found (Take or Ignore)
    &'a ConsumeAction,
);

/// Result of escape sequence processing
#[derive(Debug)]
struct EscResult<'a>(pub &'a str, pub &'a str);

/// Result of substring scanning operation
#[derive(Debug)]
enum SubStrResult<'a> {
    /// Termination string found (or not found)
    TermStr(Option<&'a str>),
    /// Escape sequence found
    EscStr(EscResult<'a>),
}

/// Lexer for extracting substrings between delimiter pairs
/// 
/// The lexer scans through a string and extracts substrings that appear
/// between defined start and end delimiter pairs, handling escape sequences.
struct Lex<'a> {
    /// The input string to be scanned
    pub str: &'a str,
}

impl Lex<'_> {
    /// Get the substring starting at index `i` for the length of `n` from `self.str`
    ///
    /// # Arguments
    /// * `i` - Starting index in the string
    /// * `n` - Length of substring to extract
    ///
    /// # Returns
    /// * `Some(String)` containing the substring if indices are valid
    /// * `None` if indices are out of bounds or length is 0
    fn substring(&self, i: usize, n: usize) -> Option<String> {
        if n == 0 || i + n > self.str.len() {
            None
        } else {
            Some(
                self.str
                    .chars()
                    .into_iter()
                    .skip(i)
                    .take(n)
                    .collect::<String>(),
            )
        }
    }

    /// Check if the string `s` is the same as the substring taken from `self.str` starting at index `i` with length `n`
    ///
    /// # Arguments
    /// * `i` - Starting index in the string
    /// * `n` - Length of substring to compare
    /// * `s` - String to compare against
    ///
    /// # Returns
    /// * `Some(&str)` containing `s` if the substring starts with `s`
    /// * `None` if the substring doesn't start with `s` or indices are invalid
    fn is_substring_same_as_string<'a>(&self, i: usize, n: usize, s: &'a str) -> Option<&'a str> {
        let substring = self.substring(i, n);
        match substring {
            Some(str) => {
                if str.starts_with(s) {
                    Some(s)
                } else {
                    None
                }
            }
            None => None,
        }
    }

    /// Check if the start string starts with the given string `s`
    ///
    /// # Arguments
    /// * `start_str` - Optional start string to check
    /// * `s` - String to check if `start_str` starts with it
    ///
    /// # Returns
    /// * `Some(&str)` containing `s` if `start_str` starts with `s`
    /// * `None` if `start_str` doesn't start with `s` or is `None`
    fn does_start_string_start_with_s<'a>(
        &self,
        start_str: &Option<String>,
        s: &'a str,
    ) -> Option<&'a str> {
        if start_str.is_some() && start_str.as_ref().unwrap().starts_with(s) {
            Some(s)
        } else {
            None
        }
    }

    /// Check if the substring starting at index `i` and length `n` is the same as `s` or any escape sequence in `esc`
    ///
    /// # Arguments
    /// * `i` - Starting index in the string
    /// * `n` - Length of substring to check
    /// * `s` - Termination string to look for
    /// * `esc` - Slice of escape sequence tuples (escape_string, replacement_string)
    /// * `res` - Mutable reference to store the result
    fn is_substring_same_as_string_or_esc_seq<'a>(
        &self,
        i: usize,
        n: usize,
        s: &'a str,
        esc: &[(&'a str, &'a str)],
        res: &mut SubStrResult<'a>,
    ) {
        let result = match self.substring(i, n) {
            Some(str) => {
                if str == s {
                    SubStrResult::TermStr(Some(s))
                } else {
                    let found = esc.iter().find_map(|esc_seq| {
                        if self
                            .is_substring_same_as_string(i, esc_seq.0.len(), esc_seq.0)
                            .is_some()
                        {
                            Some(esc_seq)
                        } else {
                            None
                        }
                    });
                    match found {
                        Some(esc_seq) => SubStrResult::EscStr(EscResult(esc_seq.0, esc_seq.1)),
                        None => SubStrResult::TermStr(None),
                    }
                }
            }
            None => SubStrResult::TermStr(None),
        };

        *res = result;
    }

    /// Get the substring by joining all fragments and increment the iterator
    ///
    /// # Arguments
    /// * `str_parts` - Vector of string fragments collected so far
    /// * `start_of_what_i_want` - Optional starting index of the substring
    /// * `ch` - Tuple containing (length, character) for substring calculation
    /// * `result` - Vector to store the final extracted substring
    /// * `en` - End delimiter string
    /// * `it` - Character iterator
    /// * `consume_action` - Action to take (Take or Ignore)
    fn get_sub_string<'a>(
        &'a self,
        str_parts: &mut Vec<String>,
        start_of_what_i_want: Option<usize>,
        ch: (usize, char),
        result: &mut Vec<String>,
        en: &&str,
        it: &mut std::iter::Enumerate<std::str::Chars<'_>>,
        consume_action: &ConsumeAction,
    ) {
        if *consume_action == ConsumeAction::Take {
            str_parts.push(
                self.substring(start_of_what_i_want.unwrap(), ch.0)
                    .unwrap_or_else(|| "".to_string()),
            );
            result.push(str_parts.join("").to_string());
        }
        (1..en.len()).for_each(|_| {
            it.next();
        });
    }

    /// Get a string that consists of the left substring and the escaped sequence
    /// Replace the escaped sequence with the substitute string and continue looking for the end of the substring
    ///
    /// # Arguments
    /// * `str_parts` - Vector of string fragments collected so far
    /// * `start_of_what_i_want` - Mutable reference to the starting index
    /// * `ch` - Tuple containing (index, character) of current position
    /// * `sub` - Replacement string for the escape sequence
    /// * `esc` - Escape string that was found
    /// * `it` - Character iterator
    fn get_escaped_string<'a>(
        &'a self,
        str_parts: &mut Vec<String>,
        start_of_what_i_want: &mut Option<usize>,
        ch: (usize, char),
        sub: String,
        esc: &&str,
        it: &mut std::iter::Enumerate<std::str::Chars<'_>>,
    ) {
        let esc_string = self.substring(start_of_what_i_want.unwrap(), ch.0).unwrap();

        str_parts.push(esc_string);
        str_parts.push(sub);
        (1..esc.len()).for_each(|_| {
            it.next();
        });
        match it.next() {
            Some(ch) => {
                *start_of_what_i_want = Some(ch.0);
            }
            None => (),
        }
    }

    /// Given a list of start and end strings, return all strings between these delimiting strings in `self.str`
    ///
    /// Takes the first delimiting strings that matches and skips the rest. This means you need to be careful
    /// how the delimiters are defined (longer matches should come before shorter ones).
    ///
    /// # Arguments
    /// * `start_end` - Slice of `StartEndTuple` references defining delimiter pairs
    ///
    /// # Returns
    /// * `String` containing all extracted substrings joined by newlines
    pub fn get_substrings_between_two_strings(
        &self,
        start_end: &mut [&StartEndTuple<'static>],
    ) -> String {
        let mut result = Vec::<String>::new();

        //
        // get unique start tules and sort list by first elelent in the tuple
        //
        let binding = Itertools::unique_by(start_end.iter(), |x| x.0)
            .sorted_by(|a, b| b.0.len().cmp(&a.0.len()));

        let start_end_tuple = binding.as_slice();

        let mut it = self.str.chars().enumerate();

        let max_start_length = start_end_tuple.into_iter().map(|value| value.0.len()).max();

        let start_characters: Vec<char> = start_end_tuple
            .into_iter()
            .map(|value| value.0.chars().nth(0).unwrap())
            .collect();

        while let Some(ch) = it.next() {
            if start_characters.contains(&ch.1) {
                let start_string = self.substring(ch.0, max_start_length.unwrap());
                for StartEndTuple(st, en, esc_seq, consume_action) in start_end_tuple {
                    if let Some(_) = self.does_start_string_start_with_s(&start_string, st) {
                        // I have the start , go to the end of the start
                        //
                        let mut character: Option<(usize, char)> = None;
                        let mut start_of_end_char: Option<(usize, char)> = None;
                        let mut prev_char: Option<(usize, char)> = None;

                        (0..st.len()).for_each(|_| {
                            character = it.next();
                        });
                        let mut start_of_what_i_want = Some(character.unwrap().0);
                        let mut result_of_scan = SubStrResult::TermStr(None);
                        let mut str_parts = Vec::<String>::new();

                        loop {
                            if character.is_none() {
                                break;
                            }
                            let chars_to_be_checked = en.len();
                            let mut chars_checked = 0usize;

                            let mut en_it = en.chars();

                            loop {
                                if character.unwrap().1 == en_it.nth(0).unwrap() {
                                    if chars_checked == 0 {
                                        start_of_end_char = character;
                                    }
                                    chars_checked += 1;
                                } else {
                                    chars_checked = 0;
                                    en_it = en.chars();
                                }

                                if chars_checked == chars_to_be_checked {
                                    break;
                                }

                                prev_char = character;
                                character = it.next();
                                if character.is_none() {
                                    break;
                                }
                            }

                            if character.is_some() {
                                self.is_substring_same_as_string_or_esc_seq(
                                    start_of_end_char.unwrap().0,
                                    en.len(),
                                    en,
                                    esc_seq,
                                    &mut result_of_scan,
                                );
                            }

                            match &result_of_scan {
                                SubStrResult::TermStr(Some(_)) => {
                                    self.get_sub_string(
                                        &mut str_parts,
                                        start_of_what_i_want,
                                        (
                                            start_of_end_char.unwrap().0
                                                - start_of_what_i_want.unwrap(),
                                            ' ',
                                        ),
                                        &mut result,
                                        &en,
                                        &mut it,
                                        &consume_action,
                                    );
                                    break;
                                }
                                SubStrResult::TermStr(None) if character.is_none() => {
                                    self.get_sub_string(
                                        &mut str_parts,
                                        start_of_what_i_want,
                                        (prev_char.unwrap().0 - start_of_what_i_want.unwrap(), ' '),
                                        &mut result,
                                        &en,
                                        &mut it,
                                        &consume_action,
                                    );
                                    break;
                                }
                                SubStrResult::EscStr(EscResult(esc, sub)) => {
                                    self.get_escaped_string(
                                        &mut str_parts,
                                        &mut start_of_what_i_want,
                                        ch,
                                        sub.to_string(),
                                        esc,
                                        &mut it,
                                    );
                                }
                                _ => break,
                            }
                        }
                        break;
                    }
                }
            }
        }
        result.join("\n")
    }
}

/// Scan source code for comments and return them as a string
///
/// This function is exposed to JavaScript via `wasm_bindgen` and is the main entry point
/// for the comment scanning functionality. It extracts various types of comments from
/// source code including:
/// - Block comments (`/** ... * /`)
/// - Line comments (`/// ...`)
/// - Business comments (`//b ...`)
/// - Triple-quoted strings (`""" ... """`) - ignored
/// - Double-quoted strings (`" ... "`) - ignored (with escape sequence handling)
///
/// # Arguments
/// * `str` - JavaScript string containing the source code to scan
///
/// # Returns
/// * `JsString` containing all extracted comments joined by newlines
///
/// # Note
/// Delimiter order matters: longer matches should come before shorter ones when they
/// share common prefixes.
#[wasm_bindgen]
pub fn scan_for_comments(str: JsString) -> JsString {
    let lexer = Lex {
        str: &str.as_string().unwrap(),
    };
    
    // Setup the delimiters - NOTE order matters: longest match first then shorter matches
    // in case of same characters in match
    let mut start_end_delim = [
        &StartEndTuple(&"/**", &"*/", &[], &ConsumeAction::Take),
        &StartEndTuple(&"///", &"\n", &[], &ConsumeAction::Take),
        &StartEndTuple(&"//b", &"\n", &[], &ConsumeAction::Take),
        &StartEndTuple(&"\"\"\"", &"\"\"\"", &[], &ConsumeAction::Ignore),
        &StartEndTuple(&"\"", &"\"", &[("\\\"", "\"")], &ConsumeAction::Ignore),
    ];

    lexer
        .get_substrings_between_two_strings(&mut start_end_delim)
        .into()
}
