def generate_file(megs):
    f = open(f'../tests/just_over_{megs}megs.c', 'w')
    # python seems to add an extra nul byte on its own
    byte_count = (megs * 1024 * 1024)
    f.seek(byte_count)
    f.write('\0')
    f.close()


def main():
    generate_file(4)


if __name__ == '__main__':
    main()
