struct strbuf {
  char * data;
};

struct hostinfo {
	struct strbuf hostname;
	struct strbuf canon_hostname;
	struct strbuf ip_address;
	struct strbuf tcp_port;
	unsigned int hostname_lookup_done : 1;
	unsigned int saw_extended_args : 1;
};