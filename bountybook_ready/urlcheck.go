package main

import (
    "bufio"
    "fmt"
    "net/http"
    "os"
    "strings"
    "sync"
    "time"
)

type result struct {
    index int
    line  string
}

func checkURL(index int, url string, client *http.Client, sem chan struct{}, out chan<- result, wg *sync.WaitGroup) {
    defer wg.Done()
    sem <- struct{}{}
    defer func() { <-sem }()

    req, err := http.NewRequest(http.MethodHead, url, nil)
    if err != nil {
        out <- result{index, fmt.Sprintf("ERROR %s", url)}
        return
    }
    resp, err := client.Do(req)
    if err != nil {
        out <- result{index, fmt.Sprintf("ERROR %s", url)}
        return
    }
    resp.Body.Close()
    out <- result{index, fmt.Sprintf("%d %s", resp.StatusCode, url)}
}

func main() {
    if len(os.Args) != 2 {
        fmt.Fprintln(os.Stderr, "usage: urlcheck <file>")
        os.Exit(2)
    }

    f, err := os.Open(os.Args[1])
    if err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
    defer f.Close()

    var urls []string
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        s := strings.TrimSpace(scanner.Text())
        if s == "" || strings.HasPrefix(s, "#") {
            continue
        }
        urls = append(urls, s)
    }
    if err := scanner.Err(); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }

    client := &http.Client{Timeout: 15 * time.Second}
    sem := make(chan struct{}, 10)
    out := make(chan result, len(urls))
    var wg sync.WaitGroup

    for i, u := range urls {
        wg.Add(1)
        go checkURL(i, u, client, sem, out, &wg)
    }
    wg.Wait()
    close(out)

    results := make([]string, len(urls))
    for r := range out {
        results[r.index] = r.line
    }
    for _, line := range results {
        fmt.Println(line)
    }
}
