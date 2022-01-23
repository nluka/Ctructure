def generate_file(name, byte_count):
    f = open(f'../tests/{name}', 'w')
    f.seek(byte_count - 1)
    f.write('\0')
    f.close()


def main():
    generate_file('exactly512megs.c', 1024 * 1024 * 512)
    generate_file('justover512megs.c', (1024 * 1024 * 512) + 1)


if __name__ == '__main__':
    main()
