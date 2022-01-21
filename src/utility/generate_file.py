def generate_file(name, byte_count):
    f = open(f'../tests/{name}', 'w')
    f.seek(byte_count - 1)
    f.write('\0')
    f.close()


def main():
    generate_file('exactly4megs.c', 1024 * 1024 * 4)
    generate_file('justover4megs.c', (1024 * 1024 * 4) + 1)


if __name__ == '__main__':
    main()
