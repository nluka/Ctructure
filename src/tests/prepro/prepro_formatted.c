#if !defined(__cplusplus) && ( \
    !defined(__STDC_VERSION__) || \
    __STDC_VERSION__ < 199901L \
  )
  #if defined(_MSC_VER)
    #define BLAKE2_INLINE __inline
  #elif defined(__GNUC__)
    #define BLAKE2_INLINE __inline__
  #else
    #define BLAKE2_INLINE
  #endif
#else
  #define BLAKE2_INLINE inline
#endif