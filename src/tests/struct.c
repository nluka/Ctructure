struct strbuf {
  char * data;
};

struct hostinfo {
  struct strbuf a;
  struct strbuf b;
  struct strbuf c;
  struct strbuf d;
  unsigned int e: 1;
  unsigned int f: 1;
};

struct strbuf str = { 0 };

union any_object {
  struct strbuf a;
  struct strbuf b;
  struct strbuf c;
  struct strbuf d;
  struct strbuf e;
};