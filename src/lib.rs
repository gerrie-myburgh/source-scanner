use std::{convert::TryFrom, str::FromStr};

use js_sys::*;
use itertools::Itertools;
use wasm_bindgen::prelude::wasm_bindgen;

//
// Type definitions for the tuple of comments and strings
//
type StartStr<'a> = &'a str;
type EndStr<'a> = &'a str;

#[derive(Eq)]
#[derive(PartialEq)]
#[derive(Hash)]
enum ConsumeAction {
    Take,
    Ignore,
}

//
// start string to look for, end string to end looking for, the lis of escape sequences
// for the string between start end end strings.
//
#[derive(Eq)]
#[derive(PartialEq)]
#[derive(Hash)]
struct StartEndTuple<'a>(StartStr<'a>, EndStr<'a>, &'a [(&'a str, &'a str)], &'a ConsumeAction);

//
// escape result th string to be sscaped and the relacement string
//
struct EscResult<'a>(pub &'a str, pub &'a str);

enum SubStrResult<'a> {
    //
    //termination string
    //
    TermStr(Option<&'a str>),
    //
    // escape sequence string
    //
    EscStr(EscResult<'a>),
}

//
// The lexer definition and implimentation
//
struct Lex<'a> {
    pub str: &'a str,
}

impl Lex<'_> {
    ///
    /// Get the substring starting at index `i` for the length of `n` from `self.str`
    ///
    fn substring(&self, i: usize, n: usize) -> Option<&str> {
        if n == 0 || i + n > self.str.len() { None } else { Some(&self.str[i..i + n]) }
    }

    ///
    /// Check if the string `s` is the same as the substring taken from `self.str` starting at index `i` with length `n`
    ///
    fn is_substring_same_as_string<'a>(&self, i: usize, n: usize, s: &'a str) -> Option<&'a str> {
        match self.substring(i, n) {
            Some(str) => {
                if str == s { Some(s) } else { None }
            }
            None => None,
        }
    }

    ///
    /// Check if the substring starting at index `i` and length `n` is the same as `s` or any escape sequence in `esc`
    ///
    fn is_substring_same_as_string_or_esc_seq<'a>(
        &self,
        i: usize,
        n: usize,
        s: &'a str,
        esc: &[(&'a str, &'a str)],
        res: &mut SubStrResult<'a>
    ) {
        let result = match self.substring(i, n) {
            Some(str) => {
                if str == s {
                    SubStrResult::TermStr(Some(s))
                } else {
                    let found = esc.iter().find_map(|esc_seq| {
                        if
                            self
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

    ///
    /// get the substring by joining all the fragment and incriment the iterator
    ///
    fn get_sub_string<'a>(
        &'a self,
        str_parts: &mut Vec<&'a str>,
        start_of_what_i_want: Option<usize>,
        ch: (usize, char),
        result: &mut Vec<String>,
        en: &&str,
        it: &mut std::iter::Enumerate<std::str::Chars<'_>>,
        consume_action: &ConsumeAction
    ) {
        if *consume_action == ConsumeAction::Take {
            str_parts.push(&self.str[start_of_what_i_want.unwrap()..ch.0]);

            result.push(str_parts.join("").to_string());
        }
        (1..en.len()).for_each(|_| {
            it.next();
        });
    }

    ///
    /// get a string that consist of the left substring and the escaped sequense
    /// replace the escaped sequence with the substitute string and carry on
    /// looking for the end of the substring
    ///
    fn get_escaped_string<'a>(
        &'a self,
        str_parts: &mut Vec<&'a str>,
        start_of_what_i_want: &mut Option<usize>,
        ch: (usize, char),
        sub: &&'a str,
        esc: &&str,
        it: &mut std::iter::Enumerate<std::str::Chars<'_>>
    ) {
        str_parts.push(&self.str[start_of_what_i_want.unwrap()..ch.0]);
        str_parts.push(&sub);
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

    ///
    /// given a list of start and end strings return all the strings between these
    /// 2 delimiting strings in the self.str. Take the first delimiting strings that matches
    /// and skip the rest. This means that you need to be carefull how the delimiters are
    /// defined.
    ///
    pub fn get_substrings_between_two_strings(
        &self,
        start_end: &mut [&StartEndTuple<'static>]
    ) -> String {
        let mut result = Vec::<String>::new();

        //
        // get unique start tules and sort list by first elelent in the tuple
        //
        let binding = Itertools::unique_by(start_end.iter(), |x| { x.0 }).sorted_by(|a, b| {
            b.0.len().cmp(&a.0.len())
        });

        let start_end_tuple = binding.as_slice();

        let mut it = self.str.chars().enumerate();

        while let Some(ch) = it.next() {
            for StartEndTuple(st, en, esc_seq, consume_action) in start_end_tuple {
                if let Some(_) = self.is_substring_same_as_string(ch.0, st.len(), st) {
                    // I have the start , go to the end of the start
                    (1..st.len()).for_each(|_| {
                        it.next();
                    });

                    let mut result_of_scan = SubStrResult::TermStr(None);

                    let mut start_of_what_i_want = Option::None::<usize>;
                    let mut str_parts = Vec::<&str>::new();

                    // get all characters up to the start of the end
                    while let Some(ch) = it.next() {
                        if start_of_what_i_want.is_none() {
                            start_of_what_i_want = Some(ch.0);
                        }

                        self.is_substring_same_as_string_or_esc_seq(
                            ch.0,
                            en.len(),
                            en,
                            esc_seq,
                            &mut result_of_scan
                        );

                        match &result_of_scan {
                            SubStrResult::TermStr(Some(_)) => {
                                self.get_sub_string(
                                    &mut str_parts,
                                    start_of_what_i_want,
                                    ch,
                                    &mut result,
                                    &en,
                                    &mut it,
                                    &consume_action
                                );
                                break;
                            }
                            SubStrResult::TermStr(None) => {
                                ();
                            }
                            SubStrResult::EscStr(EscResult(esc, sub)) => {
                                self.get_escaped_string(
                                    &mut str_parts,
                                    &mut start_of_what_i_want,
                                    ch,
                                    sub,
                                    esc,
                                    &mut it
                                );
                            }
                        }
                    }
                    break;
                }
            }
        }
        result.join("\n")
    }
}

#[wasm_bindgen]
pub fn scan_for_comments(str: JsString) -> JsString {
    
    let parse_str : String = str.into();
    let lexer = Lex {
        str: &parse_str,
    };
    //
    // setup the delimeters NOTE order matters. longest match first then shorter matches
    // in case of same characters in match
    //
    let mut start_end_delim = [
        &StartEndTuple(&"/**", &"*/", &[], &ConsumeAction::Take),
        &StartEndTuple(&"///", &"\n", &[], &ConsumeAction::Take),
        &StartEndTuple(&"//", &"\n", &[], &ConsumeAction::Take),
        &StartEndTuple(&"\"\"\"", &"\"\"\"", &[], &ConsumeAction::Ignore),
        &StartEndTuple(&"\"", &"\"", &[("\\\"", "\"")], &ConsumeAction::Ignore),
    ];

    lexer.get_substrings_between_two_strings(&mut start_end_delim).into()
}

