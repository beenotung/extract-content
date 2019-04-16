function test(url: string) {
  fetch(url).then(res => res.text());
}
test('https://lihkg.com/thread/847443/page/1');
